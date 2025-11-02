import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import IMAGES from "../../../assets";
import { BASE_URL } from '@env';

export default function HomeEditPage({ navigation, route }) {
    const { postId } = route.params;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [contentLengthAlertShown, setContentLengthAlertShown] = useState(false);
    const [price, setPrice] = useState('');
    const [isbn, setIsbn] = useState('');
    const [tradeMethod, setTradeMethod] = useState('');
    const [status, setStatus] = useState('');
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

    const isValidISBN = (isbn) => {
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        return /^(?:\d{10}|\d{13})$/.test(cleanIsbn);
    };

    const fetchBookByISBN = async (isbn) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            const url = `${BASE_URL}/search/isbn?isbn=${isbn}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`서버 에러: ${text}`);
            }

            const data = await response.json();

            // 필요한 필드만 추출
            if (data.items && data.items.length > 0) {
                const book = data.items[0];
                return {
                    title: book.title,
                    author: book.author,
                    publisher: book.publisher,
                    discount: book.discount,
                    image: book.image,
                    isbn: book.isbn,
                };
            } else {
                return null;
            }
        } catch (e) {
            console.error('책 정보 가져오기 실패:', e);
            return null;
        }
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
            setIsbn(data.isbn);
            setTradeMethod(data.tradeMethod);
            setStatus(data.status);

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

            if (!isbn) {
                alert('ISBN을 입력해주세요.');
                return;
            }

            if (!isValidISBN(isbn)) {
                alert('유효하지 않은 ISBN입니다. 10자리 또는 13자리 숫자를 입력하세요.');
                return;
            }

            let bookInfo = null;
            if (isbn) {
                bookInfo = await fetchBookByISBN(isbn);
            }

            Alert.alert(
                '네이버 최저가 확인',
                bookInfo?.title
                    ? `책 제목: ${bookInfo.title}\n네이버 최저가: ${bookInfo.discount ? `${Number(bookInfo.discount).toLocaleString()}원` : ''}`
                    : '최저가 정보를 찾을 수 없습니다.\n그래도 수정하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel',
                    },
                    {
                        text: '확인',
                        onPress: async () => {

                            const body = {
                                title,
                                content,
                                price: parseInt(price, 10),
                                isbn,
                                tradeMethod: tradeMethod === 'ALL' ? 'ALL' : tradeMethod,
                                status,
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
                        },
                    },
                ]
            );
        } catch (err) {
            console.error('수정 오류:', err);
        }
    };


    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
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
                <TextInput style={styles.input}
                    placeholder="제목을 입력하세요."
                    value={title}
                    onChangeText={setTitle} />

                <Text style={styles.label}>내용</Text>
                <TextInput
                    style={[styles.input, { height: hp('15%') }]}
                    placeholder="내용을 입력하세요. (500자)"
                    maxLength={500}
                    multiline
                    value={content}
                    onChangeText={(text) => {
                        if (text.length >= 500 && !contentLengthAlertShown) {
                            Alert.alert('내용은 500자까지만 입력할 수 있습니다.');
                            setContentLengthAlertShown(true);
                        }
                        if (text.length < 500 && contentLengthAlertShown) {
                            setContentLengthAlertShown(false);
                        }
                        setContent(text);
                    }}
                />

                <Text style={styles.label}>가격</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="₩ 가격을 입력하세요."
                    value={price}
                    onChangeText={setPrice}
                />

                <Text style={styles.label}>ISBN</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="도서 ISBN을 입력하세요 (10 or 13자리)"
                    value={isbn}
                    onChangeText={setIsbn}
                />

                <Text style={styles.label}>거래 방식</Text>
                <View style={styles.optionsRow}>
                    {['DIRECT', 'DELIVERY'].map((method) => {
                        const isSelected =
                            tradeMethod === method || tradeMethod === 'ALL';
                        return (
                            <TouchableOpacity
                                key={method}
                                style={[
                                    styles.optionBtn,
                                    isSelected && styles.optionSelected,
                                ]}
                                onPress={() => {
                                    if (tradeMethod === method) {
                                        setTradeMethod('');
                                    } else if (
                                        (tradeMethod === 'DIRECT' && method === 'DELIVERY') ||
                                        (tradeMethod === 'DELIVERY' && method === 'DIRECT')
                                    ) {
                                        setTradeMethod('ALL');
                                    } else {
                                        setTradeMethod(method);
                                    }
                                }}
                            >
                                <Text
                                    style={isSelected ? styles.optionTextSelected : styles.optionText}
                                >
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
        height: hp(5),
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
