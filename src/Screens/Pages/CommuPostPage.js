import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Text,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

export default function CommuPostPage({ navigation }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPeople, setSelectedPeople] = useState("1");
    const [images, setImages] = useState([]);
    const [title, setTitle] = useState('');
    const [contentRecruit, setContentRecruit] = useState('');
    const [contentIntroduce, setContentIntroduce] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('서울');
    const [recruitAlertShown, setRecruitAlertShown] = useState(false);
    const [introduceAlertShown, setIntroduceAlertShown] = useState(false);

    const regions = [
        '서울', '부산', '대구', '인천', '광주', '대전', '울산',
        '세종', '제주', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남',
    ];

    const handleSelectImage = async () => {
        if (images.length >= 1) {
            Alert.alert("사진은 최대 1장까지 등록 가능합니다.");
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("권한이 필요합니다", "사진첩 접근 권한을 허용해주세요.");
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                const selectedUris = result.assets.map((asset) => asset.uri);

                const allowedCount = Math.min(1 - images.length, selectedUris.length);
                if (allowedCount < selectedUris.length) {
                    Alert.alert("사진은 최대 1장까지 등록 가능합니다.");
                }

                const allowedUris = selectedUris.slice(0, allowedCount);
                setImages([...images, ...allowedUris.map(uri => ({ uri }))]);
            }
        } catch (e) {
            console.log("사진첩 열기 에러:", e);
        }
    };


    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {

        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            if (!title.trim() || !contentRecruit.trim() || !contentIntroduce.trim()) {
                return Alert.alert('제목, 모집 공고, 동아리 소개를 모두 입력하세요.');
            }

            if (images.length === 0) {
                return Alert.alert('사진을 반드시 첨부해야 합니다.');
            }

            const regionMap = {
                '서울': 'SEOUL', '부산': 'BUSAN', '대구': 'DAEGU', '인천': 'INCHEON',
                '광주': 'GWANGJU', '대전': 'DAEJEON', '울산': 'ULSAN', '세종': 'SEJONG',
                '제주': 'JEJU', '경기': 'GYEONGGI', '강원': 'GANGWON', '충북': 'CHUNGBUK',
                '충남': 'CHUNGNAM', '전북': 'JEONBUK', '전남': 'JEONNAM', '경북': 'GYEONGBUK',
                '경남': 'GYEONGNAM',
            };

            const dto = {
                title: title.trim(),
                region: regionMap[selectedRegion] || selectedRegion,
                recruitment: contentRecruit.trim(),
                introduction: contentIntroduce.trim(),
                maxParticipants: parseInt(selectedPeople, 10),
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
            };

            const dtoFileUri = FileSystem.cacheDirectory + 'community_dto.json';
            await FileSystem.writeAsStringAsync(dtoFileUri, JSON.stringify(dto), { encoding: 'utf8' });

            const formData = new FormData();
            formData.append('dto', {
                uri: dtoFileUri,
                name: 'community_dto.json',
                type: 'application/json',
            });

            images.forEach((img, i) => {
                const uri = img.uri;
                const filename = uri.split('/').pop() || `photo_${i}.jpg`;
                const ext = filename.split('.').pop().toLowerCase();
                const type = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('images', { uri, name: filename, type });
            });

            const url = `${BASE_URL}/cambooks/community`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('서버 응답:', text);
                return Alert.alert('작성에 실패했습니다.');
            }

            navigation.navigate('RouteScreen', {
                screen: 'CommunityScreen',
                params: { selectedTab: '커뮤니티' },
            });

        } catch (error) {
            console.error('작성 실패:', error);
            Alert.alert('작성 중 문제가 발생했습니다.', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.navigate("RouteScreen")} style={{ marginLeft: wp(4) }}>
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: wp(6), height: wp(6) }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <ScrollView>

                    <View style={[styles.photoContainer, { marginBottom: hp(2) }]}>
                        <TouchableOpacity style={[styles.photoEdit, { marginLeft: wp(3) }]} onPress={handleSelectImage}>
                            <FontAwesome name="image" size={wp(5)} color="black" />
                            <Text style={styles.photoText}>{images.length}/1</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.photoHint}>사진을 1장만 첨부할 수 있습니다.</Text>

                    <View style={styles.imagePreviewContainer}>
                        {images.map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: image.uri }}
                                    style={styles.imageBox}
                                />
                                <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    style={styles.removeBtn}
                                >
                                    <FontAwesome name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.titleEdit}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="동아리 이름을 입력하세요."
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={styles.contentsInput}
                            placeholder="모집 공고를 입력하세요. (500자)"
                            maxLength={500}
                            multiline
                            value={contentRecruit}
                            onChangeText={(text) => {
                                if (text.length >= 500 && !recruitAlertShown) {
                                    alert('모집 공고는 500자까지만 입력할 수 있습니다.');
                                    setRecruitAlertShown(true);
                                }
                                if (text.length < 500 && recruitAlertShown) {
                                    setRecruitAlertShown(false);
                                }
                                setContentRecruit(text);
                            }}
                        />

                    </View>

                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={styles.contentsInput}
                            placeholder="동아리 소개를 입력하세요. (500자)"
                            maxLength={500}
                            multiline
                            value={contentIntroduce}
                            onChangeText={(text) => {
                                if (text.length >= 500 && !introduceAlertShown) {
                                    alert('동아리 소개는 500자까지만 입력할 수 있습니다.');
                                    setIntroduceAlertShown(true);
                                }
                                if (text.length < 500 && introduceAlertShown) {
                                    setIntroduceAlertShown(false);
                                }
                                setContentIntroduce(text);
                            }}
                        />
                    </View>

                    <View style={[styles.dateEdit, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3) }]}>
                        <Text style={[styles.dateText, { width: '40%' }]}>모집 시작일</Text>
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                if (date && date > endDate) {
                                    Alert.alert('날짜 오류', '모집 시작일은 모집 종료일보다 늦을 수 없습니다.', [{ text: '확인' }]);
                                    return;
                                }
                                date && setStartDate(date);
                            }}
                            style={{ width: '60%' }}
                        />
                    </View>

                    <View style={[styles.dateEdit, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3) }]}>
                        <Text style={[styles.dateText, { width: '40%' }]}>모집 종료일</Text>
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                if (date && date < startDate) {
                                    Alert.alert('날짜 오류', '모집 종료일은 모집 시작일보다 빠를 수 없습니다.', [{ text: '확인' }]);
                                    return;
                                }
                                date && setEndDate(date);
                            }}
                            style={{ width: '60%' }}
                        />
                    </View>

                    <View style={[styles.dateEdit, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3) }]}>
                        <Text style={[styles.dateText, { width: '40%' }]}>지역 선택</Text>
                        <Picker
                            selectedValue={selectedRegion}
                            onValueChange={(itemValue) => setSelectedRegion(itemValue)}
                            style={{ width: '40%' }}
                        >
                            {regions.map((region, index) => (
                                <Picker.Item key={index} label={region} value={region} />
                            ))}
                        </Picker>
                    </View>

                    <View style={[styles.dateEdit, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3) }]}>
                        <Text style={[styles.dateText, { width: '40%' }]}>모집 인원</Text>
                        <Picker
                            selectedValue={selectedPeople}
                            style={{ width: '40%' }}
                            onValueChange={(itemValue) => setSelectedPeople(itemValue)}
                        >
                            {Array.from({ length: 100 }, (_, i) => (
                                <Picker.Item key={i} label={`${i + 1}명`} value={`${i + 1}`} />
                            ))}
                        </Picker>
                    </View>

                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.postBtn} onPress={handleSubmit}>
                    <Text style={styles.postBtnText}>작성 완료</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    topView: { height: hp(5), justifyContent: 'center' },
    middleView: { flex: 1, backgroundColor: 'white', marginTop: hp(2) },
    bottomView: {
        height: hp('8%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    photoContainer: {
        flexDirection: 'row',
        width: wp(90),
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    imageWrapper: {
        marginRight: wp('2%'),
        marginBottom: wp('2%'),
    },
    imageBox: {
        width: wp('18%'),
        height: wp('18%'),
        borderRadius: 8,
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        padding: 3,
    },
    photoEdit: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(12),
        height: wp(12),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
    },
    photoText: { fontSize: wp(3), marginTop: 4 },
    photoHint: { fontSize: wp(3), color: 'gray', marginLeft: wp(5) },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: hp('1%'),
        marginHorizontal: wp('5%'),
    },
    photoImage: {
        width: wp(20),
        height: wp(20),
        margin: wp(1),
        borderRadius: wp(2),
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        padding: 3,
    },
    titleEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp(90),
        height: hp(6),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginTop: hp(1),
        marginBottom: hp(3),
    },
    titleInput: { marginLeft: wp(5) },
    contentsEdit: {
        alignSelf: 'center',
        width: wp(90),
        height: hp(20),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginBottom: hp(3),
    },
    contentsInput: { padding: wp(5) },
    dateEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp(90),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: wp(3),
        marginBottom: hp(3),
        paddingVertical: hp(1),
    },
    dateText: { fontSize: wp(4) },
    postBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('80%'),
        height: hp('5%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
        marginBottom: hp('1%'),
    },
    postBtnText: {
        fontSize: wp(6),
        fontWeight: 'bold',
        color: 'white',
    },
});
