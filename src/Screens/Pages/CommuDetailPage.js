import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, Text, ScrollView, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IMAGES from '../../../assets';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function CommuDetailPage({ navigation, route }) {
    const { postId } = route.params;
    const BASE_URL = 'http://localhost:8080';

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isHeartFilled, setIsHeartFilled] = useState(false);
    const [focusedButton, setFocusedButton] = useState('모집공고');
    const [isJoined, setIsJoined] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [myUserId, setMyUserId] = useState(null);
    const [visibleOptionId, setVisibleOptionId] = useState(null);


    const regionMap = {
        SEOUL: '서울',
        BUSAN: '부산',
        DAEGU: '대구',
        INCHEON: '인천',
        GWANGJU: '광주',
        DAEJEON: '대전',
        ULSAN: '울산',
        SEJONG: '세종',
        JEJU: '제주',
        GYEONGGI: '경기',
        GANGWON: '강원',
        CHUNGBUK: '충북',
        CHUNGNAM: '충남',
        JEONBUK: '전북',
        JEONNAM: '전남',
        GYEONGBUK: '경북',
        GYEONGNAM: '경남',
    };

    const formatCreatedAt = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}월 ${day}일 ${hours}:${minutes}`;
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


    const getKoreanRegion = (regionCode) => regionMap[regionCode] || regionCode;


    useEffect(() => {
        fetchPostDetail();
        fetchComments();
        loadHeartStatus();
        loadJoinStatus();
        loadMyUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPostDetail();
        }, [postId])
    );

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

    const fetchComments = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`${BASE_URL}/cambooks/community/comment?postId=${postId}`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!res.ok) throw new Error(`댓글 불러오기 실패: ${res.status}`);

            const text = await res.text();

            if (!text || text.trim() === "" || text.trim() === "null") {
                setComments([]);
                return;
            }

            const data = JSON.parse(text);
            setComments(data);
        } catch (err) {
            console.error('댓글 불러오기 실패:', err);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;

        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`${BASE_URL}/cambooks/community/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId: postId,
                    comment: commentText.trim(),
                }),
            });

            if (!res.ok) throw new Error('댓글 등록 실패');

            setCommentText('');
            await fetchComments();
        } catch (err) {
            console.error(err);
            Alert.alert('오류', '댓글 작성 중 문제가 발생했습니다.');
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
            const key = `liked_community_${postId}`;
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("로그인이 필요합니다.");

            const res = await fetch(`${BASE_URL}/cambooks/post-likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId: postId,
                    postType: "COMMUNITY"
                })
            });

            if (!res.ok) throw new Error("좋아요 토글 실패");

            const newState = !isHeartFilled;
            console.log('좋아요 상태 토글, 이전:', isHeartFilled, '새로운:', newState);

            setIsHeartFilled(newState);

            if (newState) {
                await AsyncStorage.setItem(key, 'true');
                setPost(prev => ({ ...prev, postLikeCount: prev.postLikeCount + 1 }));
            } else {
                await AsyncStorage.removeItem(key);
                setPost(prev => ({ ...prev, postLikeCount: Math.max(prev.postLikeCount - 1, 0) }));
            }

        } catch (e) {
            console.error("좋아요 토글 실패:", e);
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
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('로그인이 필요합니다.');

            // join API 단일 호출로 토글 처리
            const response = await fetch(`${BASE_URL}/cambooks/community/join/${postId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('참가 토글 실패');

            // 참가 상태 반전
            const newJoinStatus = !isJoined;
            setIsJoined(newJoinStatus);

            // 참가자 수 증가/감소
            setPost(prev => ({
                ...prev,
                currentParticipants: newJoinStatus
                    ? prev.currentParticipants + 1
                    : Math.max(prev.currentParticipants - 1, 0),
            }));

            if (newJoinStatus) {
                await AsyncStorage.setItem(`joined_community_${postId}`, 'true');
            } else {
                await AsyncStorage.removeItem(`joined_community_${postId}`);
            }

        } catch (error) {
            console.error('참가 토글 실패:', error);
        }
    };

    const loadMyUserId = async () => {
        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) return;
            setMyUserId(Number(userIdStr));
            console.log("내 userId:", userIdStr);
        } catch (e) {
            console.error("userId 로드 실패:", e);
        }
    };

    const handleDeleteAlert = () => {
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "확인",
                    style: "destructive",
                    onPress: () => {
                        handleConfirmDelete();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const showDeleteCommentAlert = (commentId) => {
        Alert.alert(
            "댓글 삭제 확인",
            "댓글을 삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel",
                },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => handleDeleteComment(commentId),
                },
            ],
            { cancelable: true }
        );
    };


    const handleConfirmDelete = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("토큰 없음");

            const response = await fetch(`${BASE_URL}/cambooks/community/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("삭제 실패");

            console.log("삭제 완료");
            navigation.goBack();
        } catch (e) {
            console.error("삭제 오류:", e);
        }
    };


    const handleDeleteComment = async (commentId) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) throw new Error("토큰 없음");

            const res = await fetch(`${BASE_URL}/cambooks/community/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok && res.status !== 204) throw new Error(`삭제 실패: ${res.status}`);

            console.log("댓글 삭제 완료");
            await fetchComments();
        } catch (e) {
            console.error("댓글 삭제 실패:", e);
            Alert.alert("오류", "댓글 삭제 중 문제가 발생했습니다.");
        }
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
                                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setShowOptions(!showOptions)}>
                                    <Image source={IMAGES.THREEDOT} resizeMode="contain" style={{ height: 12, width: 12 }} />
                                </TouchableOpacity>
                            </View>


                            {showOptions && (
                                <View style={styles.popup}>
                                    <TouchableOpacity onPress={() => {
                                        setShowOptions(false);
                                        console.log("신고하기");
                                    }}>
                                        <Text style={styles.popupItem}>신고하기</Text>
                                    </TouchableOpacity>

                                    {myUserId === post.userId && (
                                        <>
                                            <View style={styles.popupDivider} />
                                            <TouchableOpacity onPress={() => {
                                                setShowOptions(false);
                                                navigation.navigate('CommunityEditPage', { postId });
                                            }}>
                                                <Text style={styles.popupItem}>수정하기</Text>
                                            </TouchableOpacity>

                                            <View style={styles.popupDivider} />

                                            <TouchableOpacity onPress={() => {
                                                setShowOptions(false);
                                                handleDeleteAlert();
                                            }}>
                                                <Text style={styles.popupItem}>삭제하기</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}


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

                    <View>
                        {comments.length > 0 ? (
                            comments.map((comment, idx) => {
                                const createdAtFormatted = formatCreatedAt(comment.createdAt);
                                const isMyComment = comment.userId === myUserId;

                                return (
                                    <View key={idx} style={styles.commentView}>
                                        <View style={styles.commentLeft}>
                                            <Image source={IMAGES.POSTPROFILE} style={styles.commentProfile} />
                                            <Text style={styles.commentName}>{comment?.name ?? '익명'}</Text>
                                        </View>

                                        <View style={styles.commentMiddle}>
                                            <Text style={styles.commentFont}>{comment?.content ?? ''}</Text>
                                        </View>

                                        <View style={styles.commentRight}>
                                            <Text style={styles.commentTime}>{createdAtFormatted}</Text>

                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (visibleOptionId === comment.id) {
                                                        setVisibleOptionId(null);
                                                    } else {
                                                        setVisibleOptionId(comment.id);
                                                    }
                                                }}
                                                style={{ padding: 5 }}
                                            >
                                                <Image source={IMAGES.THREEDOT} resizeMode="contain" style={{ height: 12, width: 12 }} />
                                            </TouchableOpacity>

                                            {visibleOptionId === comment.id && (
                                                <View style={styles.popupComment}>
                                                    <TouchableOpacity onPress={() => {
                                                        setVisibleOptionId(null);
                                                        console.log("신고하기");
                                                    }}>
                                                        <Text style={styles.popupItem}>신고하기</Text>
                                                    </TouchableOpacity>

                                                    {isMyComment && (
                                                        <>
                                                            <View style={styles.popupDivider} />
                                                            <TouchableOpacity onPress={() => {
                                                                setVisibleOptionId(null);
                                                                showDeleteCommentAlert(comment.id);
                                                            }}>
                                                                <Text style={styles.popupItem}>삭제하기</Text>
                                                            </TouchableOpacity>
                                                        </>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={{ textAlign: 'center', color: 'gray', marginTop: 10 }}>댓글이 없습니다.</Text>
                        )}
                    </View>
                    <View style={{ height: 80 }} />
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.input}
                        placeholder="댓글을 입력하세요."
                        value={commentText}
                        onChangeText={setCommentText}
                    />
                    <TouchableOpacity style={styles.sendBtnView} onPress={handleCommentSubmit}>
                        <Image source={IMAGES.SEND} style={{ width: 25, height: 25, tintColor: 'white' }} />
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
    commentView: {
        flexDirection: 'row',
        backgroundColor: '#F9F9F9',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        width: '95%',
        alignSelf: 'center',
    },
    commentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 3,
    },
    commentProfile: {
        width: 20,
        height: 20,
        borderRadius: 15,
        marginRight: 8,
    },
    commentName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    commentMiddle: {
        flex: 5,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    commentFont: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    commentRight: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    commentTime: {
        marginLeft: 20,
        fontSize: 12,
        color: 'gray',
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
    popup: {
        position: 'absolute',
        top: hp("0.5%"),
        right: wp("5%"),
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1000,
        minWidth: 70,
    },
    popupComment: {
        position: 'absolute',
        top: 2,
        right: 20,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1000,
        minWidth: 70,
    },
    popupItem: {
        fontSize: wp("3.5%"),
        paddingVertical: 5,
        color: "#333",
    },
    popupDivider: {
        height: 1,
        backgroundColor: '#ddd',
    }
});
