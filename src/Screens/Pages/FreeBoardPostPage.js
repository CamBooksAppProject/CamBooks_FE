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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

export default function FreeBoardPostPage({ navigation }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [contentAlertShown, setContentAlertShown] = useState(false);

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('입력 오류', '제목과 내용을 모두 입력하세요.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('accessToken');

            const response = await fetch(`${BASE_URL}/cambooks/general-forum`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('서버 응답 오류:', text);
                Alert.alert('작성 실패', `에러 코드: ${response.status}`);
                return;
            }

            navigation.navigate('RouteScreen', {
                screen: 'FreeBoardPage',
                params: { selectedTab: '자유게시판' },
            });




        } catch (err) {
            console.error('작성 중 오류:', err);
            Alert.alert('에러', '작성 중 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
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
                <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
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
