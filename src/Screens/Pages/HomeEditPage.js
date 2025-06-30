import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import IMAGES from "../../../assets";

export default function HomeEditPage({ navigation, route }) {
    const { postId } = route.params;
    const BASE_URL = 'http://localhost:8080';

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState('');
    const [tradeMethod, setTradeMethod] = useState('');
    const [images, setImages] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        fetchUserId();
        fetchPostDetail();
    }, []);

    const fetchUserId = async () => {
        const id = await AsyncStorage.getItem('userId');
        if (id) setUserId(Number(id));
    };

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`${BASE_URL}/cambooks/used-trade/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!res.ok) throw new Error('불러오기 실패');

            const data = await res.json();
            setTitle(data.title);
            setContent(data.content);
            setPrice(String(data.price));
            setTradeMethod(data.tradeMethod);
            const base = BASE_URL;
            const imgs = (data.imageUrls || []).map(url => ({
                uri: url.startsWith('http') ? url : `${base}${url}`,
            }));
            setImages(imgs);
        } catch (err) {
            console.error('상세 조회 실패:', err);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!title || !content || !price || !tradeMethod) {
                alert('모든 항목을 입력해주세요.');
                return;
            }

            const body = {
                title,
                content,
                price: parseInt(price, 10),
                tradeMethod
            };

            const res = await fetch(`${BASE_URL}/cambooks/used-trade/${postId}?memberId=${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('수정 실패');

            alert('수정 완료!');
            navigation.navigate('HomeDetailPage', { postId });
        } catch (err) {
            console.error('수정 오류:', err);
        }
    };


    return (
        <View style={styles.container}>
            <SafeAreaView />

            <View style={styles.topView}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 15 }}
                >
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: 25, height: 25 }}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: wp('5%') }}>

                <Text style={styles.label}>등록된 이미지 (※ 수정 불가)</Text>
                <ScrollView horizontal style={styles.imageRow}>
                    {images.map((img, idx) => (
                        <Image key={idx} source={{ uri: img.uri }} style={styles.image} />
                    ))}
                </ScrollView>
                <Text style={styles.noticeText}>※ 이미지는 수정할 수 없습니다</Text>
                <Text style={styles.label}>제목</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                <Text style={styles.label}>내용</Text>
                <TextInput
                    style={[styles.input, { height: hp('15%') }]}
                    multiline
                    value={content}
                    onChangeText={setContent}
                />

                <Text style={styles.label}>가격</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />

                <Text style={styles.label}>거래 방식 (1개 선택)</Text>
                <View style={styles.optionsRow}>
                    {['DIRECT', 'DELIVERY'].map(method => {
                        const isSelected = tradeMethod === method;
                        return (
                            <TouchableOpacity
                                key={method}
                                style={[
                                    styles.optionBtn,
                                    isSelected && styles.optionSelected
                                ]}
                                onPress={() => setTradeMethod(method)}
                            >
                                <Text style={isSelected ? styles.optionTextSelected : styles.optionText}>
                                    {method === 'DIRECT' ? '직거래' : '택배거래'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>


                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>수정 완료</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topView: {
        height: hp('10%'),
        justifyContent: 'center',
    },
    label: {
        fontSize: wp('4%'),
        fontWeight: 'bold',
        marginTop: hp('2%')
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: wp('4%'),
        marginTop: hp('1%'),
    },
    optionsRow: {
        flexDirection: 'row',
        marginTop: hp('1%'),
    },
    optionBtn: {
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('4%'),
        borderRadius: wp('2%'),
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: wp('2%'),
        backgroundColor: 'white',
    },

    optionSelected: {
        backgroundColor: '#67574D',
        borderColor: '#67574D',
    },

    optionText: {
        color: '#333',
        fontSize: wp('3.8%'),
        fontWeight: '500',
    },

    optionTextSelected: {
        color: 'white',
        fontSize: wp('3.8%'),
        fontWeight: '500',
    },

    imageRow: {
        marginTop: hp('1%'),
        flexDirection: 'row',
    },
    image: {
        width: wp('25%'),
        height: wp('25%'),
        borderRadius: 8,
        marginRight: wp('2%'),
    },
    noticeText: {
        fontSize: wp('3.2%'),
        color: 'gray',
        marginTop: hp('0.5%'),
    },
    submitBtn: {
        marginTop: hp('3%'),
        backgroundColor: '#67574D',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitText: {
        color: 'white',
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
    }
});
