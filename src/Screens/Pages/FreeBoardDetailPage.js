import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, TouchableOpacity, Image, SafeAreaView,
    Text, ScrollView, TextInput, Alert
} from 'react-native';
import IMAGES from '../../../assets';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FreeBoardDetailPage({ route, navigation }) {
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isHeartFilled, setIsHeartFilled] = useState(false);
    const BASE_URL = 'http://localhost:8080';


    useEffect(() => {
        fetchPostDetail();
        fetchComments();
        loadHeartStatus();
    }, []);

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
            const res = await fetch(`http://localhost:8080/cambooks/general-forum/${postId}`, {
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

    if (!post) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>게시글을 불러오는 중입니다...</Text>
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
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={IMAGES.POSTPROFILE} style={{ height: 25, width: 25 }} />
                            <Text style={styles.nameFont}>{post.writerName}</Text>
                            <Text style={styles.timeFont}>{post.createdAt?.slice(0, 10) ?? ''}</Text>
                        </View>

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
        width: '100%',
        height: '10%',
        justifyContent: 'center',
        // borderBottomWidth: 0.5,
        // borderBottomColor: 'gray',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: '73%',
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
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    commentTime: {
        fontSize: 12,
        color: 'gray',
    },

    goodFont: {
        marginLeft: 5,
        fontSize: 11,
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
    }

});