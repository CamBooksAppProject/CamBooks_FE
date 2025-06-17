import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Text, ScrollView, SafeAreaView } from 'react-native';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function HomePostPage({ navigation }) {
    const [selectedOptions, setSelectedOptions] = useState({
        direct: false,
        delivery: false,
        university: false,
    });

    const [profileImage, setProfileImage] = useState(require('../../../assets/SwapLOGO.png'));
    const [photoModalVisible, setPhotoModalVisible] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        // fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('https://your.api.endpoint.com/posts');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('API 통신 오류:', error);
        }
    };

    const toggleOption = (option) => {
        setSelectedOptions(prevState => ({
            ...prevState,
            [option]: !prevState[option],
        }));
    };

    const openPhotoModal = () => {
        setPhotoModalVisible(true);
    };

    const closePhotoModal = () => {
        setPhotoModalVisible(false);
    };

    const handleSelectPhoto = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage({ uri: result.assets[0].uri });
            closePhotoModal();
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.navigate("RouteScreen")} style={{ marginLeft: wp('4%') }}>
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
                    <View style={{ flexDirection: 'row', width: wp('90%'), alignSelf: 'center', alignItems: 'center', marginBottom: hp('3%') }}>
                        <View style={styles.photoEdit}>
                            <TouchableOpacity onPress={openPhotoModal} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <FontAwesome name="camera" size={wp('5%')} color="black" />
                                <Text style={{ fontSize: wp('3%') }}>0/4</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.optionsBtn, {
                            marginLeft: wp('7%'),
                            backgroundColor: selectedOptions.direct ? '#67574D' : 'white'
                        }]}>
                            <TouchableOpacity onPress={() => toggleOption('direct')}>
                                <Text style={{
                                    fontSize: wp('3.5%'),
                                    fontWeight: 'bold',
                                    color: selectedOptions.direct ? 'white' : 'black'
                                }}>직거래</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.optionsBtn, {
                            backgroundColor: selectedOptions.delivery ? '#67574D' : 'white'
                        }]}>
                            <TouchableOpacity onPress={() => toggleOption('delivery')}>
                                <Text style={{
                                    fontSize: wp('3.5%'),
                                    fontWeight: 'bold',
                                    color: selectedOptions.delivery ? 'white' : 'black'
                                }}>택배거래</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.optionsBtn, {
                            backgroundColor: selectedOptions.university ? '#67574D' : 'white'
                        }]}>
                            <TouchableOpacity onPress={() => toggleOption('university')}>
                                <Text style={{
                                    fontSize: wp('3.5%'),
                                    fontWeight: 'bold',
                                    color: selectedOptions.university ? 'white' : 'black'
                                }}>타대학</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.titleEdit}>
                        <TextInput
                            style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                            placeholder="제목을 입력하세요."
                        />
                    </View>

                    <View style={styles.priceEdit}>
                        <TextInput
                            style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                            placeholder="₩ 가격을 입력하세요."
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={{ padding: wp('4%'), fontSize: wp('3.5%') }}
                            placeholder="내용을 입력하세요. (500자)"
                            maxLength={500}
                            multiline={true}
                        />
                    </View>
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.postBtn}>
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
        backgroundColor: 'white',
        width: '100%',
        height: hp('10%'),
        justifyContent: 'center',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: hp('73%'),
    },
    bottomView: {
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        height: hp('9%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    photoEdit: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('12%'),
        height: wp('12%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
    },
    optionsBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: wp('4%'),
        width: wp('18%'),
        height: hp('4.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 10,
    },
    titleEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('3%'),
    },
    priceEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6.5%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('3%'),
    },
    contentsEdit: {
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('40%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
    },
    postBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('90%'),
        height: hp('6.5%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
    },
    cBtn: {
        marginTop: hp('1%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('6%'),
        alignSelf: 'flex-start',
    },
    cBtnText: {
        color: 'white',
        fontSize: wp('4%'),
        fontWeight: 'bold',
    },
});
