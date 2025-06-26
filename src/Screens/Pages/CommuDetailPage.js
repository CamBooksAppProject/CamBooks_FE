import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, Text, ScrollView, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IMAGES from '../../../assets';

export default function CommuDetailPage({ navigation, route }) {
    const { postId } = route.params;
    const BASE_URL = 'http://192.168.0.19:8080';

    const [post, setPost] = useState(null);
    const [isHeartFilled, setIsHeartFilled] = useState(false);
    const [focusedButton, setFocusedButton] = useState('모집공고');
    const [isJoined, setIsJoined] = useState(false);

    const regionMap = {
        SEOUL: '서울',
        GYEONGGI: '경기',
        INCHEON: '인천',
        JEONBUK: '전북',
    };

    const getKoreanRegion = (regionCode) => regionMap[regionCode] || regionCode;


    useEffect(() => {
        fetchPostDetail();
        loadHeartStatus();
        loadJoinStatus();
    }, []);

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            const response = await fetch(`${BASE_URL}/cambooks/community/${postId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log(' 받아온 post 데이터:', data);
            setPost(data);
        } catch (error) {
            console.error('상세 API 오류:', error);
        }
    };

    const handleButtonPress = (button) => {
        setFocusedButton(button);
    };

    const loadHeartStatus = async () => {
        try {
            const key = `liked_community_${postId}`;
            const saved = await AsyncStorage.getItem(key);
            setIsHeartFilled(saved === 'true');
        } catch (e) {
            console.error('좋아요 상태 불러오기 실패:', e);
        }
    };

    const handleHeartPress = async () => {
        try {
            const newState = !isHeartFilled;
            setIsHeartFilled(newState);

            const key = `liked_community_${postId}`;
            if (newState) {
                await AsyncStorage.setItem(key, 'true');
            } else {
                await AsyncStorage.removeItem(key);
            }
        } catch (e) {
            console.error('좋아요 상태 저장 실패:', e);
        }
    };

    const loadJoinStatus = async () => {
        try {
            const key = `joined_community_${postId}`;
            const saved = await AsyncStorage.getItem(key);
            if (saved === 'true') setIsJoined(true);
        } catch (e) {
            console.error('참가 상태 불러오기 실패:', e);
        }
    };

    const handleJoinToggle = async () => {
        try {
            const key = `joined_community_${postId}`;
            if (isJoined) {
                await AsyncStorage.removeItem(key); // 참가 취소
                setIsJoined(false);

                setPost(prev => ({
                    ...prev,
                    currentParticipants: Math.max(prev.currentParticipants - 1, 0),
                }));
            } else {
                await AsyncStorage.setItem(key, 'true'); // 참가
                setIsJoined(true);

                setPost(prev => ({
                    ...prev,
                    currentParticipants: prev.currentParticipants + 1,
                }));
            }
        } catch (e) {
            console.error('참가 토글 실패:', e);
        }
    };


    const formatDateTime = (isoStr) => {
        if (!isoStr) return '-';
        const d = new Date(isoStr);
        const yyyy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = days[d.getDay()];
        return `${yyyy}-${mm}-${dd} (${dayName})`;
    };

    if (!post) {
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Image source={IMAGES.BACK} resizeMode="contain" tintColor="#474747" style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <ScrollView>
                    <View style={styles.mainView}>
                        <View style={styles.photo}>
                            {post.imgUrls && post.imgUrls.length > 0 ? (
                                <Image
                                    source={{ uri: post.imgUrls[0].startsWith('http') ? post.imgUrls[0] : `${BASE_URL}${post.imgUrls[0]}` }}
                                    resizeMode="cover"
                                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                                />
                            ) : null}
                        </View>

                        <View style={{ flexDirection: 'column', marginLeft: 15, flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                <Text style={styles.titleFont}>{post.title || '제목'}</Text>
                                <TouchableOpacity style={{ marginLeft: 'auto' }}>
                                    <Image source={IMAGES.THREEDOT} resizeMode="contain" style={{ height: 12, width: 12 }} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Image source={IMAGES.PEOPLE} resizeMode="contain" style={{ height: 13, width: 13 }} />
                                <Text style={styles.peopleFont}>
                                    {post.currentParticipants} / {post.maxParticipants}
                                </Text>
                                <Text style={styles.regionFont}>{getKoreanRegion(post.region)}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                <Text style={styles.timeLabel}>모집 시작일: </Text>
                                <Text style={styles.timeFont}>{formatDateTime(post.startDateTime)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.timeLabel}>모집 종료일: </Text>
                                <Text style={styles.timeFont}>{formatDateTime(post.endDateTime)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
                        <TouchableOpacity
                            style={[styles.btn3, focusedButton === '모집공고' && styles.btnFocused]}
                            onPress={() => handleButtonPress('모집공고')}
                        >
                            <Text style={[styles.btnText, focusedButton === '모집공고' && styles.btnTextFocused]}>
                                모집공고
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn3, focusedButton === '동아리소개' && styles.btnFocused]}
                            onPress={() => handleButtonPress('동아리소개')}
                        >
                            <Text style={[styles.btnText, focusedButton === '동아리소개' && styles.btnTextFocused]}>
                                동아리소개
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 15 }}>
                        {focusedButton === '모집공고' ? (
                            <Text style={styles.contentsFont}>{post.recruitment || '모집공고 내용이 없습니다.'}</Text>
                        ) : (
                            <Text style={styles.contentsFont}>{post.introduction || '동아리소개 내용이 없습니다.'}</Text>
                        )}
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 25,
                            paddingHorizontal: 20,
                        }}
                    >
                        <TouchableOpacity>
                            <Text style={{ fontSize: 11, color: 'gray' }}>신고하기</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn2, { backgroundColor: isJoined ? '#67574D' : '#67574D' }]}
                            onPress={handleJoinToggle}
                        >
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>
                                {isJoined ? '참가 취소' : '참가하기'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.heartBtnView} onPress={handleHeartPress}>
                            <Image
                                source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                                resizeMode="contain"
                                style={{ width: 20, height: 20 }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.line} />

                    {/* 댓글 영역 - 필요하면 여기에 추가 */}

                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <View style={styles.inputView}>
                    <TextInput style={styles.input} placeholder="댓글을 입력하세요." />
                    <TouchableOpacity style={styles.sendBtnView}>
                        <Image source={IMAGES.SEND} resizeMode="contain" tintColor="white" style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    mainView: {
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        width: '95%',
        height: 180,
        flexDirection: 'row',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        padding: 15,
    },
    photo: {
        width: 150,
        height: 150,
        borderRadius: 10,
        backgroundColor: '#A50034',
        overflow: 'hidden',
    },
    peopleFont: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    timeLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
    },
    timeFont: {
        fontSize: 13,
        color: 'gray',
        marginLeft: 5,
    },
    btn3: {
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
        height: 32,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: '#D0D1D1',
    },
    btn2: {
        marginLeft: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 28,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: '#67574D',
        borderColor: '#D0D1D1',
    },
    btnFocused: {
        backgroundColor: '#67574D',
        borderColor: '#D0D1D1',
    },
    btnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    btnTextFocused: {
        color: 'white',
    },
    topView: {
        backgroundColor: 'white',
        width: '100%',
        height: '10%',
        justifyContent: 'center',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: '73%',
    },
    titleFont: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
    },
    contentsFont: {
        fontSize: 16,
        lineHeight: 24,
        color: 'black',
    },
    bottomView: {
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        height: '9%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    heartBtnView: {
        backgroundColor: 'white',
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderColor: 'gray',
        borderWidth: 0.2,
        borderRadius: 12,
    },
    line: {
        marginTop: 15,
        marginBottom: 15,
        alignSelf: 'center',
        width: '95%',
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
    },
    inputView: {
        width: '85%',
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#F9F9F9',
        width: '85%',
        height: 45,
        paddingHorizontal: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    sendBtnView: {
        backgroundColor: '#67574D',
        width: '15%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    regionFont: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 12,
        fontWeight: '600',
    },
});
