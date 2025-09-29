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
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

export default function HomePostPage({ navigation }) {
    const [selectedOptions, setSelectedOptions] = useState({
        direct: false,
        delivery: false,
    });

    const [images, setImages] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState('');
    const [isbn, setIsbn] = useState('');
    const [contentLengthAlertShown, setContentLengthAlertShown] = useState(false);


    const toggleOption = (option) => {
        setSelectedOptions({
            direct: option === 'direct',
            delivery: option === 'delivery',
        });
    };

    const isValidISBN = (isbn) => {
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        return /^(?:\d{10}|\d{13})$/.test(cleanIsbn);
    };

    const handleSelectImage = async () => {
        if (images.length >= 4) {
            Alert.alert("사진은 최대 4장까지 등록 가능합니다.");
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

                const allowedCount = Math.min(4 - images.length, selectedUris.length);
                if (allowedCount < selectedUris.length) {
                    Alert.alert("사진은 최대 4장까지 등록 가능합니다.");
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

    const postTrade = async () => {
        try {
            const memberId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            const url = `${BASE_URL}/cambooks/used-trade/${memberId}`;
            const tradeMethod = selectedOptions?.direct
                ? 'DIRECT'
                : selectedOptions?.delivery
                    ? 'DELIVERY'
                    : '';

            if (!title.trim()) return Alert.alert('제목을 입력해주세요.');
            if (!content.trim()) return Alert.alert('내용을 입력해주세요.');
            if (!price.trim() || isNaN(Number(price)))
                return Alert.alert('가격을 숫자로 입력해주세요.');
            if (!tradeMethod)
                return Alert.alert('거래 방식을 선택해주세요. (직거래 또는 택배거래)');
            if (isbn && !isValidISBN(isbn))
                return Alert.alert('유효하지 않은 ISBN입니다. 10자리 또는 13자리 숫자를 입력하세요.');
            if (images.length === 0)
                return Alert.alert('최소 1장의 사진을 반드시 첨부해야 합니다.');

            const dto = {
                title: title.trim(),
                content: content.trim(),
                price: Number(price),
                tradeMethod,
                isbn: isbn.trim(),
            };

            const dtoFileUri = FileSystem.cacheDirectory + 'dto.json';
            await FileSystem.writeAsStringAsync(dtoFileUri, JSON.stringify(dto), { encoding: FileSystem.EncodingType.UTF8 });

            const formData = new FormData();
            formData.append('dto', {
                uri: dtoFileUri,
                name: 'dto.json',
                type: 'application/json',
            });

            images.forEach((img, i) => {
                const uri = img.uri;
                const filename = uri.split('/').pop() || `photo_${i}.jpg`;
                const ext = filename.split('.').pop().toLowerCase();
                const type = ext === 'png' ? 'image/png' : 'image/jpeg';

                formData.append('images', { uri, name: filename, type });
            });

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            navigation.reset({
                index: 0,
                routes: [{ name: 'RouteScreen', state: { routes: [{ name: 'HomeScreen' }] } }],
            });
        } catch (e) {
            console.error('postTrade 에러:', e);
            Alert.alert('오류 발생', e.message);
        }
    };


    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: wp('4%') }}>
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: wp('6%'), height: hp('3%') }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <ScrollView>
                    <View style={[styles.photoContainer, { marginBottom: hp(2) }]}>
                        <TouchableOpacity style={[styles.photoEdit, { marginLeft: wp(3) }]} onPress={handleSelectImage}>
                            <FontAwesome name="image" size={wp(5)} color="black" />
                            <Text style={styles.photoText}>{images.length}/4</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.photoHint}>첫 번째 사진이 메인으로 설정됩니다.</Text>



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

                    <View style={styles.optionRow}>
                        {['direct', 'delivery'].map((optionKey) => {
                            const label = {
                                direct: '직거래',
                                delivery: '택배거래',
                            }[optionKey];

                            return (
                                <TouchableOpacity
                                    key={optionKey}
                                    style={[
                                        styles.optionsBtn,
                                        { backgroundColor: selectedOptions[optionKey] ? '#67574D' : 'white' }
                                    ]}
                                    onPress={() => toggleOption(optionKey)}
                                >
                                    <Text style={{
                                        fontSize: wp('3.5%'),
                                        fontWeight: 'bold',
                                        color: selectedOptions[optionKey] ? 'white' : 'black'
                                    }}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.titleEdit}>
                        <TextInput
                            style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                            placeholder="제목을 입력하세요."
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.priceEdit}>
                        <TextInput
                            style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                            placeholder="₩ 가격을 입력하세요."
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>

                    <View style={styles.priceEdit}>
                        <TextInput
                            style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                            placeholder="도서 ISBN을 입력하세요 (10 or 13자리)"
                            keyboardType="numeric"
                            value={isbn}
                            onChangeText={setIsbn}
                        />
                    </View>

                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={{ padding: wp('4%'), fontSize: wp('3.5%') }}
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
                    </View>
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.postBtn} onPress={postTrade}>
                    <Text style={{ fontSize: wp('6%'), fontWeight: 'bold', color: 'white' }}>작성 완료</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topView: {
        height: hp(5),
        justifyContent: 'center',
    },
    middleView: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: hp(2),
    },
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
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: hp('2%'),
        marginHorizontal: wp('5%'),
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
    optionsBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: wp('2%'),
        width: wp('30%'),
        height: hp('4.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 10,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: hp('2%'),
    },
    titleEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('2%'),
    },
    priceEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('2%'),
    },
    isbnEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('2%'),
    },
    contentsEdit: {
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('40%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('2%'),
    },
    postBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('80%'),
        height: hp('5%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
        marginBottom: hp('1%'),
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
    photoText: {
        fontSize: wp(3),
        marginTop: 4,
    },
    photoHint: {
        fontSize: wp(3),
        color: 'gray',
        marginLeft: wp(5),
        marginBottom: hp(2),
    },
});
