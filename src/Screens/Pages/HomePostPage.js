import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    Text,
    ScrollView,
    SafeAreaView
} from 'react-native';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function HomePostPage({ navigation }) {
    const [selectedOptions, setSelectedOptions] = useState({
        direct: false,
        delivery: false,
    });

    const [images, setImages] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState('');

    const toggleOption = (option) => {
        setSelectedOptions(prev => ({
            ...prev,
            [option]: !prev[option],
        }));
    };

    const handleSelectPhoto = async () => {
        if (images.length >= 4) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setImages(prev => [...prev, { uri: selectedUri }]);
        }
    };

    const handleTakePhoto = async () => {
        if (images.length >= 4) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const photoUri = result.assets[0].uri;
            setImages(prev => [...prev, { uri: photoUri }]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const postTrade = async () => {
        const url = 'http://localhost:8080/cambooks/used-trade/1';
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('로그인이 필요합니다.');

        const tradeMethod = selectedOptions.direct ? 'DIRECT' : selectedOptions.delivery ? 'DELIVERY' : '';
        if (!title.trim() || !content.trim() || !tradeMethod || isNaN(Number(price))) {
            throw new Error('입력값을 확인하세요.');
        }

        const dto = {
            title: title.trim(),
            content: content.trim(),
            price: Number(price),
            tradeMethod,
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
            let type = 'image/jpeg';
            const ext = filename.split('.').pop().toLowerCase();
            if (ext === 'png') type = 'image/png';

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

        const data = await response.json();
        console.log('응답 데이터:', data);

        navigation.reset({
            index: 0,
            routes: [{ name: 'RouteScreen', state: { routes: [{ name: 'HomeScreen' }] } }],
        });
    };

    return (
        <View style={styles.container}>
            <SafeAreaView />
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
                    <View style={styles.photoControls}>
                        <TouchableOpacity onPress={handleTakePhoto} style={styles.cBtn}>
                            <FontAwesome name="camera" size={wp('5%')} color="white" />
                            <Text style={styles.cBtnText}>카메라</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSelectPhoto} style={[styles.cBtn, { marginLeft: wp('3%') }]}>
                            <FontAwesome name="image" size={wp('5%')} color="white" />
                            <Text style={styles.cBtnText}>{images.length}/4</Text>
                        </TouchableOpacity>
                    </View>

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

                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={{ padding: wp('4%'), fontSize: wp('3.5%') }}
                            placeholder="내용을 입력하세요. (500자)"
                            maxLength={500}
                            multiline
                            value={content}
                            onChangeText={setContent}
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
        height: hp('10%'),
        justifyContent: 'center',
    },
    middleView: {
        flex: 1,
        backgroundColor: 'white',
    },
    bottomView: {
        height: hp('8%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    photoControls: {
        flexDirection: 'row',
        marginTop: hp('2%'),
        marginHorizontal: wp('5%'),
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
    cBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#67574D',
        borderRadius: 15,
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
    },
    cBtnText: {
        color: 'white',
        fontSize: wp('3.5%'),
        marginLeft: wp('2%'),
        fontWeight: 'bold',
    },
});
