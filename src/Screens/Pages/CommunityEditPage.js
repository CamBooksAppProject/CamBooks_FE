import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommnunityEditPage({ navigation, route }) {
    const { postId } = route.params;

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPeople, setSelectedPeople] = useState("1");
    const [imgUrls, setImgUrls] = useState([]);
    const [title, setTitle] = useState('');
    const [contentRecruit, setContentRecruit] = useState('');
    const [contentIntroduce, setContentIntroduce] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('서울');

    const [loading, setLoading] = useState(true);

    const regions = [
        '서울', '부산', '대구', '인천', '광주', '대전', '울산',
        '세종', '제주', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남',
    ];

    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchPostDetail();
    }, []);

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            const response = await fetch(`${BASE_URL}/cambooks/community/${postId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('게시글 정보를 가져오는데 실패했습니다.');

            const data = await response.json();

            setTitle(data.title);
            setContentRecruit(data.recruitment);
            setContentIntroduce(data.introduction);
            setSelectedRegion(data.region || '서울');
            setSelectedPeople(String(data.maxParticipants));
            setStartDate(new Date(data.startDateTime));
            setEndDate(new Date(data.endDateTime));
            setImgUrls(data.imgUrls || []);  // 반드시 넣어주세요

            setLoading(false);
        } catch (error) {
            Alert.alert('오류', error.message);
            setLoading(false);
        }
    };


    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            if (!title.trim() || !contentRecruit.trim() || !contentIntroduce.trim()) {
                alert('제목, 모집 공고, 동아리 소개를 모두 입력하세요.');
                return;
            }

            const regionMap = {
                '서울': 'SEOUL',
                '부산': 'BUSAN',
                '대구': 'DAEGU',
                '인천': 'INCHEON',
                '광주': 'GWANGJU',
                '대전': 'DAEJEON',
                '울산': 'ULSAN',
                '세종': 'SEJONG',
                '제주': 'JEJU',
                '경기': 'GYEONGGI',
                '강원': 'GANGWON',
                '충북': 'CHUNGBUK',
                '충남': 'CHUNGNAM',
                '전북': 'JEONBUK',
                '전남': 'JEONNAM',
                '경북': 'GYEONGBUK',
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

            const response = await fetch(`${BASE_URL}/cambooks/community/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('서버 응답:', text);
                alert('수정에 실패했습니다.');
                return;
            }

            alert('수정 완료되었습니다.');
            navigation.goBack(); // 또는 상세페이지로 이동

        } catch (error) {
            alert('수정 중 문제가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>로딩 중...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
            <View style={styles.topView}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: wp(4) }}
                >
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: wp(6), height: wp(6) }}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.middleView}>
                <Text style={styles.label}>등록된 이미지 (※ 수정 불가)</Text>
                <View horizontal style={styles.imageRow} showsHorizontalScrollIndicator={false}>
                    {imgUrls.length > 0 ? (
                        imgUrls.map((img, idx) => (
                            <Image
                                key={idx}
                                source={{ uri: img.startsWith('http') ? img : BASE_URL + img }}
                                style={styles.image}
                            />
                        ))
                    ) : (
                        <Text>등록된 사진이 없습니다.</Text>
                    )}
                </View>
                <Text style={styles.noticeText}>※ 이미지는 수정할 수 없습니다</Text>


                <Text style={styles.label}>제목</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                <Text style={styles.label}>모집 공고</Text>
                <TextInput
                    style={[styles.input, { height: hp('15%') }]}
                    multiline
                    value={contentRecruit}
                    onChangeText={setContentRecruit}
                />

                <Text style={styles.label}>동아리 소개</Text>
                <TextInput
                    style={[styles.input, { height: hp('15%') }]}
                    multiline
                    value={contentIntroduce}
                    onChangeText={setContentIntroduce}
                />

                <Text style={styles.label}>모집 시작일</Text>
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(e, date) => date && setStartDate(date)}
                    style={{ width: '100%' }}
                />

                <Text style={styles.label}>모집 종료일</Text>
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(e, date) => date && setEndDate(date)}
                    style={{ width: '100%' }}
                />

                <Text style={styles.label}>지역 선택</Text>
                <Picker
                    selectedValue={selectedRegion}
                    onValueChange={(itemValue) => setSelectedRegion(itemValue)}
                >
                    {regions.map((region, index) => (
                        <Picker.Item key={index} label={region} value={region} />
                    ))}
                </Picker>

                <Text style={styles.label}>모집 인원</Text>
                <Picker
                    selectedValue={selectedPeople}
                    onValueChange={(itemValue) => setSelectedPeople(itemValue)}
                >
                    {Array.from({ length: 100 }, (_, i) => (
                        <Picker.Item key={i} label={`${i + 1}명`} value={`${i + 1}`} />
                    ))}
                </Picker>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>수정 완료</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    topView: { height: hp(5), justifyContent: 'center' },
    middleView: { flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) },
    label: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginTop: hp(2),
        marginBottom: hp(1),
        color: '#333',
    },
    input: {
        borderWidth: 0.5,
        borderColor: 'gray',
        borderRadius: wp(2),
        padding: wp(3),
        fontSize: wp(4),
        backgroundColor: 'white',
        textAlignVertical: 'top',
    },
    imageRow: {
        flexDirection: 'row',
        paddingVertical: hp(1),
        paddingHorizontal: wp(1),
        backgroundColor: 'white',
    },
    image: {
        width: wp(30),
        height: wp(30),
        borderRadius: wp(2),
        marginRight: wp(2),
    },
    noticeText: {
        marginTop: hp(1),
        marginBottom: hp(3),
        color: 'gray',
        fontSize: wp(3.5),
        textAlign: 'center',
    },
    submitBtn: {
        marginTop: hp(3),
        backgroundColor: '#67574D',
        borderRadius: wp(3),
        paddingVertical: hp(1.5),
        alignItems: 'center',
        marginBottom: hp(5),
    },
    submitText: {
        color: 'white',
        fontSize: wp(5),
        fontWeight: 'bold',
    },
});
