import React, { useState, useEffect } from 'react';
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
import IMAGES from '../../../assets';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FreeBoardEditPage({ navigation, route }) {
    const { postId } = route.params;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [contentAlertShown, setContentAlertShown] = useState(false);
    const [loading, setLoading] = useState(true);

    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchPostDetail();
    }, []);

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            const response = await fetch(`${BASE_URL}/cambooks/general-forum/${postId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('게시글 정보를 가져오는데 실패했습니다.');

            const data = await response.json();

            setTitle(data.title);
            setContent(data.content);
            setLoading(false);
        } catch (error) {
            Alert.alert('오류', error.message);
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('입력 오류', '제목과 내용을 모두 입력하세요.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            const response = await fetch(`${BASE_URL}/cambooks/general-forum/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('서버 응답 오류:', text);
                Alert.alert('수정 실패', `에러 코드: ${response.status}`);
                return;
            }

            Alert.alert('성공', '게시글이 수정되었습니다.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('오류', '수정 중 문제가 발생했습니다.');
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
                <ScrollView contentContainerStyle={{ paddingVertical: hp('3%') }}>
                    <View style={styles.titleEdit}>
                        <TextInput
                            style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                            placeholder="제목을 입력하세요."
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                    <View style={styles.contentsEdit}>
                        <TextInput
                            style={{ padding: wp('4%'), fontSize: wp('3.5%') }}
                            placeholder="내용을 입력하세요. (500자)"
                            maxLength={500}
                            multiline={true}
                            value={content}
                            onChangeText={(text) => {
                                if (text.length >= 500 && !contentAlertShown) {
                                    Alert.alert('입력 제한', '내용은 500자까지만 입력할 수 있습니다.');
                                    setContentAlertShown(true);
                                }
                                if (text.length < 500 && contentAlertShown) {
                                    setContentAlertShown(false);
                                }
                                setContent(text);
                            }}
                        />
                    </View>
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.postBtn} onPress={handleEdit}>
                    <Text style={{ fontSize: wp('6%'), fontWeight: 'bold', color: 'white' }}>수정 완료</Text>
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
    titleEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('3%'),
        marginTop: hp('4%'),
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
        width: wp('80%'),
        height: hp('5%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
        marginBottom: hp('1%'),
    },
});
