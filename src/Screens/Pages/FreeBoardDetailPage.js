import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, TouchableOpacity, Image,
    Text, ScrollView, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../../assets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BASE_URL } from '@env';
import { MaterialIcons } from "@expo/vector-icons";

export default function FreeBoardDetailPage({ route, navigation }) {
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isHeartFilled, setIsHeartFilled] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [myUserId, setMyUserId] = useState(null);
    const [visibleOptionId, setVisibleOptionId] = useState(null);

    useEffect(() => {
        fetchPostDetail();
        fetchComments();
        loadHeartStatus();
        loadMyUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPostDetail();
        }, [postId])
    );

    const formatCreatedAt = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}월 ${day}일 ${hours}:${minutes}`;
    };

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`${BASE_URL}/cambooks/general-forum/${postId}`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });
            if (!res.ok) throw new Error(`에러 코드: ${res.status}`);
            const data = await res.json();
            setPost(data);
        } catch (err) {
            console.error('게시글 불러오기 실패:', err);
        }
    };

    const fetchComments = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`${BASE_URL}/cambooks/general-forum/comment?postId=${postId}`, {
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
            const res = await fetch(`${BASE_URL}/cambooks/general-forum/comment`, {
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





    const loadHeartStatus = async () => {
        try {
            const key = `liked_generalForum_${postId}`;
            const saved = await AsyncStorage.getItem(key);
            setIsHeartFilled(saved === 'true');
        } catch (e) {
            console.error('좋아요 상태 불러오기 실패:', e);
        }
    };

    const handleHeartPress = async () => {
        try {
            const key = `liked_generalForum_${postId}`;
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
                    postType: "GENERAL_FORUM"
                })
            });

            if (!res.ok) throw new Error("좋아요 토글 실패");

            const newState = !isHeartFilled;
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

    const loadMyUserId = async () => {
        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) return;
            setMyUserId(Number(userIdStr));
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

            const response = await fetch(`${BASE_URL}/cambooks/general-forum/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("삭제 실패");

            navigation.goBack();
        } catch (e) {
            console.error("삭제 오류:", e);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) throw new Error("토큰 없음");

            const res = await fetch(`${BASE_URL}/cambooks/general-forum/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok && res.status !== 204) throw new Error(`삭제 실패: ${res.status}`);

            await fetchComments();
        } catch (e) {
            console.error("댓글 삭제 실패:", e);
            Alert.alert("오류", "댓글 삭제 중 문제가 발생했습니다.");
        }
    };



    if (!post) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>로딩 중...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Image source={IMAGES.BACK} resizeMode="contain" tintColor="#474747" style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <ScrollView>
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialIcons
                                    name="account-circle"
                                    size={25}
                                    color="#ccc"
                                    style={{ marginRight: 5 }}
                                />
                                <Text style={styles.nameFont}>{post.writerName}</Text>
                                <Text style={[styles.timeFont, { marginLeft: 10 }]}>
                                    {post.createdAt?.slice(0, 10) ?? ''}
                                </Text>
                            </View>

                            {myUserId === post.userId && (
                                <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                                    <Image
                                        source={IMAGES.THREEDOT}
                                        resizeMode="contain"
                                        style={{ height: 13, width: 13, marginRight: 3 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>



                        {showOptions && (
                            <View style={styles.popup}>
                                <TouchableOpacity onPress={() => {
                                    setShowOptions(false);
                                    navigation.navigate('FreeBoardEditPage', { postId });
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
                            </View>
                        )}



                        <Text style={styles.titleFont}>{post.title}</Text>
                        <Text style={styles.contentsFont}>{post.content}</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25 }}>
                            <TouchableOpacity style={styles.heartBtnView} onPress={handleHeartPress}>
                                <Image
                                    source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                                    resizeMode="contain"
                                    style={{ width: 20, height: 20 }}
                                />
                            </TouchableOpacity>
                        </View>
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
                                            <MaterialIcons
                                                name="account-circle"
                                                size={20}
                                                color="#ccc"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text style={styles.commentName}>{comment?.name ?? '익명'}</Text>
                                        </View>

                                        <View style={styles.commentMiddle}>
                                            <Text style={styles.commentFont}>{comment?.content ?? ''}</Text>
                                        </View>

                                        <View style={styles.commentRight}>
                                            <Text style={styles.commentTime}>{createdAtFormatted}</Text>
                                            {isMyComment && (
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
                                                    <Image source={IMAGES.THREEDOT}
                                                        resizeMode="contain"
                                                        style={{ height: 13, width: 13 }} />
                                                </TouchableOpacity>
                                            )}

                                            {visibleOptionId === comment.id && (
                                                <View style={styles.popupComment}>
                                                    <TouchableOpacity onPress={() => {
                                                        setVisibleOptionId(null);
                                                        showDeleteCommentAlert(comment.id);
                                                    }}>
                                                        <Text style={styles.popupItem}>삭제하기</Text>
                                                    </TouchableOpacity>
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
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topView: {
        backgroundColor: 'white',
        height: hp(5),
        justifyContent: 'center',
    },
    middleView: {
        backgroundColor: 'white',
        height: hp(75),
    },
    nameFont: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    titleFont: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentsFont: {
        fontSize: 15,
        lineHeight: 23,
    },
    timeFont: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 190,
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
    photoView: {
        flexDirection: 'row',
        width: '100%',
        height: 200,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
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
        flex: 2,
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
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingHorizontal: 10,
        textAlignVertical: 'center',
    },
    sendBtnView: {
        backgroundColor: '#67574D',
        width: '15%',
        height: 45,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    chatFont: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    popup: {
        position: 'absolute',
        top: 20,
        right: 35,
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