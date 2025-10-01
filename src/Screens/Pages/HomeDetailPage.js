// 생략된 import 유지
import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Text,
    ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from "../../../assets";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BASE_URL } from '@env';
import { Feather } from '@expo/vector-icons';

const statusDisplayMap = {
    'AVAILABLE': { text: '판매중' },
    'RESERVED': { text: '예약중' },
    'COMPLETED': { text: '거래완료' },
};

const statusSendMAP = {
    '판매중': 'AVAILABLE',
    '예약중': 'RESERVED',
    '거래완료': 'COMPLETED',
};

export default function HomeDetailPage({ navigation, route }) {
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [isHeartFilled, setIsHeartFilled] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showStatusOptions, setShowStatusOptions] = useState(false);
    const [myUserId, setMyUserId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchPostDetail();
            loadHeartStatus();
            loadMyUserId();
        }, [postId])
    );

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("로그인이 필요합니다.");

            const response = await fetch(`${BASE_URL}/cambooks/used-trade/${postId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            let bookInfo = null;
            if (data.isbn) {
                bookInfo = await fetchBookByISBN(data.isbn);
            }

            setPost({
                ...data,
                bookInfo,
            });

        } catch (error) {
            console.error("상세 API 오류:", error);
        }
    };


    const loadHeartStatus = async () => {
        try {
            const key = `liked_usedTrade_${postId}`;
            const saved = await AsyncStorage.getItem(key);
            setIsHeartFilled(saved === 'true');
        } catch (e) {
            console.error('좋아요 상태 불러오기 실패:', e);
        }
    };

    const handleHeartPress = async () => {
        try {
            const key = `liked_usedTrade_${postId}`;
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
                    postType: "USED_TRADE"
                })
            });

            if (!res.ok) throw new Error("좋아요 토글 실패");

            const newState = !isHeartFilled;
            setIsHeartFilled(newState);

            // 2. AsyncStorage & 로컬 카운트 업데이트
            if (newState) {
                await AsyncStorage.setItem(key, 'true');
                setPost(prev => ({ ...prev, postLikeCount: prev.postLikeCount + 1 }));
            } else {
                await AsyncStorage.removeItem(key);
                setPost(prev => ({ ...prev, postLikeCount: Math.max(prev.postLikeCount - 1, 0) }));
            }

            // 3. 좋아요 수 증가/감소 DB 반영
            const countRes = await fetch(`${BASE_URL}/cambooks/post-likes/count`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId: postId,
                    postType: "USED_TRADE"
                })
            });

            if (!countRes.ok) {
                console.warn("좋아요 수 증가/감소 실패:", countRes.status);
            }

        } catch (e) {
            console.error("좋아요 처리 실패:", e);
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


    const handleConfirmDelete = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("토큰 없음");

            const response = await fetch(`${BASE_URL}/cambooks/used-trade/${postId}`, {
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

    const handleStatusUpdate = async (statusText) => {
        setShowStatusOptions(false);
        if (statusText === '취소') return;

        const statusKey = statusSendMAP[statusText];
        if (!statusKey) return;

        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("로그인이 필요합니다.");

            const requestBody = {
                title: post.title,
                content: post.content,
                price: post.price,
                isbn: post.isbn,
                tradeMethod: post.tradeMethod,
                status: statusKey,
            };

            const response = await fetch(
                `${BASE_URL}/cambooks/used-trade/${postId}?memberId=${myUserId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`상태 변경 실패: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();

            setPost((prev) => ({
                ...prev,
                status: result.status,
                bookInfo: prev.bookInfo,
            }));

        } catch (error) {
            console.error("상태 변경 요청 중 에러 발생:", error.message);
        }
    };



    if (!post) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text>로딩 중...</Text>
            </View>
        );
    }

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

            <View style={styles.middleView}>
                <ScrollView>
                    <View style={styles.photoView}>
                        <ScrollView horizontal>
                            {(post.imageUrls?.length > 0 ? post.imageUrls : []).map((uri, index) => {
                                const fullUri = uri.startsWith("http") ? uri : `${BASE_URL}${uri}`;
                                return (
                                    <Image
                                        key={index}
                                        source={{ uri: fullUri }}
                                        style={styles.photo}
                                        resizeMode="cover"
                                    />
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={{ padding: 15 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                                justifyContent: 'space-between',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={IMAGES.POSTPROFILE}
                                    resizeMode="contain"
                                    style={{ height: 15, width: 15 }}
                                />
                                <Text style={styles.nameFont}>{post.writerName}</Text>
                                <Text style={styles.collegeFont}>{post.university}</Text>
                            </View>

                            {showOptions && (
                                <View style={styles.popup}>
                                    <TouchableOpacity onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('HomeEditPage', { postId });
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

                            {myUserId === post.userId && (
                                <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                                    <Image
                                        source={IMAGES.THREEDOT}
                                        resizeMode="contain"
                                        style={{ height: 13, width: 13 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>


                        <Text style={styles.titleFont}>{post.title}</Text>

                        <Text style={styles.tradeMethodFont}>
                            {Array.isArray(post.tradeMethod)
                                ? post.tradeMethod
                                    .map((method) => (method === "DIRECT" ? "직거래" : method === "DELIVERY" ? "택배거래" : "기타"))
                                    .join(" / ")
                                : post.tradeMethod === "DIRECT"
                                    ? "직거래"
                                    : post.tradeMethod === "DELIVERY"
                                        ? "택배거래"
                                        : "기타"}
                        </Text>

                        <Text style={styles.contentsFont}>{post.content}</Text>

                        {post.bookInfo && (
                            <View style={styles.naverBox}>
                                <Text style={styles.naverHeader}>네이버 정보</Text>

                                <View style={styles.naverRow}>
                                    {post.bookInfo.image && (
                                        <Image
                                            source={{ uri: post.bookInfo.image }}
                                            style={styles.bookImage}
                                            resizeMode="cover"
                                        />
                                    )}
                                    <View style={styles.naverInfo}>
                                        {post.bookInfo.title && (
                                            <Text style={styles.naverText}>제목: {post.bookInfo.title}</Text>
                                        )}
                                        {post.bookInfo.author && (
                                            <Text style={styles.naverText}>저자: {post.bookInfo.author}</Text>
                                        )}
                                        {post.bookInfo.publisher && (
                                            <Text style={styles.naverText}>출판사: {post.bookInfo.publisher}</Text>
                                        )}
                                        {post.bookInfo.isbn && (
                                            <Text style={styles.naverText}>ISBN: {post.bookInfo.isbn}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                marginTop: 20,
                            }}
                        >
                            <Image
                                source={IMAGES.HEART}
                                resizeMode="contain"
                                tintColor="lightgray"
                                style={{ height: 15, width: 15 }}
                            />
                            <Text style={styles.iconFont}>{post.postLikeCount}</Text>
                            <Image
                                source={IMAGES.EYE}
                                resizeMode="contain"
                                style={{ height: 17, width: 17, marginLeft: 15 }}
                            />
                            <Text style={styles.iconFont}>{post.viewCount}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <View style={styles.leftGroup}>
                    <TouchableOpacity style={styles.heartBtnView} onPress={handleHeartPress}>
                        <Image
                            source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                            resizeMode="contain"
                            style={{ width: 20, height: 20 }}
                        />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.priceFont}>
                            {post.price?.toLocaleString()}원
                        </Text>
                        {post.bookInfo?.discount && (
                            <Text style={styles.discountFont}>
                                네이버 최저가: {Number(post.bookInfo.discount).toLocaleString()}원
                            </Text>
                        )}
                    </View>
                </View>

                {showStatusOptions && (
                    <View style={styles.statusPopup}>
                        <TouchableOpacity onPress={() => handleStatusUpdate('판매중')}>
                            <Text style={styles.statusPopupItem}>판매중</Text>
                        </TouchableOpacity>
                        <View style={styles.statusPopupDivider} />
                        <TouchableOpacity onPress={() => handleStatusUpdate('예약중')}>
                            <Text style={styles.statusPopupItem}>예약중</Text>
                        </TouchableOpacity>
                        <View style={styles.statusPopupDivider} />
                        <TouchableOpacity onPress={() => handleStatusUpdate('거래완료')}>
                            <Text style={styles.statusPopupItem}>거래완료</Text>
                        </TouchableOpacity>
                        <View style={styles.statusPopupDivider} />
                        <TouchableOpacity onPress={() => handleStatusUpdate('취소')}>
                            <Text style={styles.statusPopupItem}>취소</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.rightGroup}>
                    {myUserId === post.userId ? (

                        <TouchableOpacity
                            style={styles.statusChangeBtnView}
                            onPress={() => setShowStatusOptions(!showStatusOptions)}
                        >
                            <Text style={styles.statusChangeFont}>
                                {statusDisplayMap[post.status].text}
                            </Text>
                            <Feather
                                name={showStatusOptions ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="#67574D"
                            />
                        </TouchableOpacity>

                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.chatBtnView,
                                post.status === 'COMPLETED' && styles.disabledChatBtn
                            ]}
                            disabled={post.status === 'COMPLETED'}
                        >
                            {post.status !== 'COMPLETED' && (
                                <Image
                                    source={IMAGES.CHAT}
                                    resizeMode="contain"
                                    tintColor="white"
                                    style={{ width: 30, height: 30 }}
                                />
                            )}
                            <Text style={styles.chatFont}>
                                {post.status === 'COMPLETED' ? '거래완료' : '채팅하기'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    topView: {
        height: hp(5),
        justifyContent: 'center',
    },
    middleView: {
        flex: 1,
        backgroundColor: 'white',
    },
    photoView: {
        flexDirection: "row",
        width: "100%",
        height: wp("55%"),
        borderBottomColor: "gray",
        borderBottomWidth: 0.5,
    },
    photo: {
        width: wp("55%"),
        height: wp("55%"),
        marginRight: wp("1%"),
        backgroundColor: "#f0f0f0",
    },
    nameFont: {
        fontSize: wp("3.3%"),
        fontWeight: "bold",
        marginLeft: wp("1.5%"),
    },
    collegeFont: {
        fontSize: wp("3%"),
        color: "gray",
        marginLeft: wp("1.5%"),
    },
    titleFont: {
        fontSize: wp("5%"),
        fontWeight: "bold",
        marginBottom: hp("1.5%"),
        color: "black",
    },
    tradeMethodFont: {
        fontSize: wp("4%"),
        fontWeight: "bold",
        color: "#67574D",
        marginBottom: hp("1%"),
    },
    contentsFont: {
        fontSize: wp("4%"),
        lineHeight: hp("3%"),
        color: "black",
    },
    iconFont: {
        fontSize: wp("3.2%"),
        fontWeight: "bold",
        color: "gray",
        marginLeft: wp("1.5%"),
    },
    priceFont: {
        fontSize: wp("5%"),
        fontWeight: "bold",
        color: "#111",
    },
    discountFont: {
        fontSize: wp("4%"),
        fontWeight: "bold",
        color: "#888",
    },
    bottomView: {
        flexDirection: "row",
        backgroundColor: "white",
        width: "100%",
        height: hp('10%'),
        alignItems: "center",
        justifyContent: "flex-start",
        borderTopWidth: 0.5,
        borderTopColor: "gray",
    },
    leftGroup: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: wp('5%'),
    },
    rightGroup: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        right: wp('5%'),
    },
    statusChangeBtnView: {
        backgroundColor: "white",
        width: wp("30%"),
        height: hp("5%"),
        justifyContent: "space-evenly",
        alignItems: "center",
        borderRadius: wp("3%"),
        borderColor: "#67574D",
        borderWidth: 1.5,
        flexDirection: "row",
    },
    statusChangeFont: {
        color: "#67574D",
        fontSize: wp("4%"),
        fontWeight: "bold",
        marginLeft: wp("3%"),
    },
    heartBtnView: {
        backgroundColor: "white",
        width: wp("8%"),
        height: wp("8%"),
        justifyContent: "center",
        alignItems: "center",
        borderColor: "gray",
        borderWidth: 0.2,
        borderRadius: wp("3%"),
    },
    chatBtnView: {
        backgroundColor: "#67574D",
        width: wp("30%"),
        height: hp("5%"),
        justifyContent: "space-evenly",
        alignItems: "center",
        borderRadius: wp("3%"),
        flexDirection: "row",
    },
    disabledChatBtn: {
        backgroundColor: '#777777',
    },
    chatFont: {
        color: "white",
        fontSize: wp("4.8%"),
        fontWeight: "bold",
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
    },
    popupItem: {
        fontSize: wp("3.5%"),
        paddingVertical: 5,
        color: "#333",
    },
    popupDivider: {
        height: 1,
        backgroundColor: '#ddd',
    },
    statusPopup: {
        position: 'absolute',
        width: wp("45%"),
        bottom: hp("10%"),
        right: wp(0),
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1000,
    },
    statusPopupItem: {
        alignSelf: "center",
        fontSize: wp("5%"),
        paddingVertical: 5,
        color: "#333",
        fontWeight: "bold",
    },
    statusPopupDivider: {
        height: 2,
        backgroundColor: '#ddd',
    },
    naverBox: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    naverHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    naverRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    bookImage: {
        width: 80,
        height: 110,
        borderRadius: 6,
        marginRight: 12,
    },
    naverInfo: {
        flex: 1,
    },
    naverText: {
        fontSize: 14,
        marginBottom: 6,
        color: "#444",
    },

});
