import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Text,
    ScrollView,
    SafeAreaView,
    Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function CommuPostPage({ navigation }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPeople, setSelectedPeople] = useState("1");
    const [photo, setPhoto] = useState(null);  // 단일 사진 상태
    const [title, setTitle] = useState('');
    const [contentRecruit, setContentRecruit] = useState('');
    const [contentIntroduce, setContentIntroduce] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('서울');
    const [recruitAlertShown, setRecruitAlertShown] = useState(false);
    const [introduceAlertShown, setIntroduceAlertShown] = useState(false);

    const regions = ['서울', '경기', '인천', '전북'];

    const handleSelectPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setPhoto({ uri: selectedUri });
        }
    };

    const handleTakePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const photoUri = result.assets[0].uri;
            setPhoto({ uri: photoUri });
        }
    };

    const removeImage = () => {
        setPhoto(null);
    };
    const handleSubmit = async () => {
        try {
            const url = 'http://localhost:8080/cambooks/community';
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            if (!title.trim() || !contentRecruit.trim() || !contentIntroduce.trim()) {
                alert('제목, 모집 공고, 동아리 소개를 모두 입력하세요.');
                return;
            }

            if (!photo) {
                alert('사진을 반드시 첨부해야 합니다.');
                return;
            }

            const regionMap = {
                '서울': 'SEOUL',
                '경기': 'GYEONGGI',
                '인천': 'INCHEON',
                '전북': 'JEONBUK',
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

            // 1. JSON DTO 파일 생성 (임시 캐시 경로)
            const dtoFileUri = FileSystem.cacheDirectory + 'community_dto.json';
            await FileSystem.writeAsStringAsync(dtoFileUri, JSON.stringify(dto), {
                encoding: FileSystem.EncodingType.UTF8,
            });

            // 2. FormData 구성
            const formData = new FormData();

            formData.append('dto', {
                uri: dtoFileUri,
                name: 'community_dto.json',
                type: 'application/json',
            });

            // 이미지 첨부 (1장)
            const uri = photo.uri;
            const filename = uri.split('/').pop() || 'photo.jpg';
            const ext = filename.split('.').pop().toLowerCase();
            const type = ext === 'png' ? 'image/png' : 'image/jpeg';

            formData.append('images', {
                uri,
                name: filename,
                type,
            });

            // 3. 서버 요청
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Content-Type 생략 → fetch가 자동 설정
                },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('서버 응답:', text);
                alert('작성에 실패했습니다.');
                return;
            }

            const data = await response.json();
            console.log('커뮤니티 작성 성공:', data);

            // 4. 페이지 이동
            navigation.navigate('RouteScreen', {
                screen: 'CommunityScreen',
                params: { selectedTab: '커뮤니티' },
            });


        } catch (error) {
            console.error('작성 실패:', error.message);
            alert('작성 중 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView />
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
                        <TouchableOpacity style={styles.photoEdit} onPress={handleTakePhoto}>
                            <FontAwesome name="camera" size={wp(5)} color="black" />
                            <Text style={styles.photoText}>카메라</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.photoEdit, { marginLeft: wp(3) }]} onPress={handleSelectPhoto}>
                            <FontAwesome name="image" size={wp(5)} color="black" />
                            <Text style={styles.photoText}>{photo ? 1 : 0}/1</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.photoHint}>사진을 1장만 첨부할 수 있습니다.</Text>

                    <View style={styles.photoPreview}>
                        {photo ? (
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: photo.uri }}
                                    style={styles.photoImage}
                                />
                                <TouchableOpacity
                                    onPress={removeImage}
                                    style={styles.removeBtn}
                                >
                                    <FontAwesome name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : null}
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
    topView: { height: hp('10%'), justifyContent: 'center' },
    middleView: { flex: 1, backgroundColor: 'white' },
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
    photoHint: { fontSize: wp(3), color: 'gray', marginLeft: wp(5), marginBottom: hp(2) },
    photoPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp(3),
        marginHorizontal: wp(5),
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
