// 생략된 import 유지
import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Text,
    ScrollView,
} from "react-native";
import IMAGES from "../../../assets";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Alert } from "react-native";

export default function HomeDetailPage({ navigation, route }) {
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [isHeartFilled, setIsHeartFilled] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [myWriterName, setMyWriterName] = useState(null);

    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchPostDetail();
        loadHeartStatus();
        loadMyWriterName();
    }, []);

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
            console.log("post data:", data);

            setPost(data);
        } catch (error) {
            console.error("상세 API 오류:", error);
        }
    };


    const loadHeartStatus = async () => {
        try {
            const key = `liked_usedTrade_${postId}`;
            const saved = await AsyncStorage.getItem(key);
            console.log('좋아요 상태 불러오기:', saved);
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

    const loadMyWriterName = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const response = await fetch(`${BASE_URL}/cambooks/member/info`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("유저 정보 조회 실패");

            const data = await response.json();
            console.log('내 name:', data.name);
            setMyWriterName(data.name);
        } catch (e) {
            console.error("로그인 유저 name 가져오기 실패:", e);
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
            const memberIdStr = await AsyncStorage.getItem('userId');
            const memberId = Number(memberIdStr);

            if (!token || !memberId) throw new Error("토큰 또는 memberId 없음");

            const response = await fetch(`${BASE_URL}/cambooks/used-trade/${memberId}?postId=${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("삭제 실패");

            console.log("삭제 완료");
            setShowConfirm(false);
            navigation.goBack(); // 삭제 후 뒤로가기
        } catch (e) {
            console.error("삭제 오류:", e);
            setShowConfirm(false);
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
            <SafeAreaView />
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
                                justifyContent: 'space-between', // 추가
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
                                        console.log("신고하기");
                                    }}>
                                        <Text style={styles.popupItem}>신고하기</Text>
                                    </TouchableOpacity>

                                    {myWriterName === post.writerName && (
                                        <>
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



                            <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
                                <Image
                                    source={IMAGES.THREEDOT}
                                    resizeMode="contain"
                                    style={{ height: 13, width: 13 }}
                                />
                            </TouchableOpacity>
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
                <TouchableOpacity style={styles.heartBtnView}
                    onPress={handleHeartPress}>
                    <Image
                        source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                        resizeMode="contain"
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
                <View style={{ marginLeft: 10, marginBottom: hp('1%') }}>
                    <Text style={styles.priceFont}>
                        {typeof post.price === "number"
                            ? `${post.price.toLocaleString()}원`
                            : post.price}
                    </Text>
                </View>
                <TouchableOpacity style={styles.chatBtnView}>
                    <Image
                        source={IMAGES.CHAT}
                        resizeMode="contain"
                        tintColor="white"
                        style={{ width: 30, height: 30 }}
                    />
                    <Text style={styles.chatFont}>채팅하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    topView: {
        height: hp('10%'),
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
        fontSize: wp("3.5%"),
        fontWeight: "500",
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
    lowPriceFont: {
        fontSize: wp("3.2%"),
        fontWeight: "bold",
        color: "#888",
    },
    bottomView: {
        flexDirection: "row",
        backgroundColor: "white",
        width: "100%",
        height: hp('8%'),
        alignItems: "center",
        justifyContent: "space-evenly",
        borderTopWidth: 0.5,
        borderTopColor: "gray",
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
        marginBottom: hp('1%'),
    },
    chatBtnView: {
        backgroundColor: "#67574D",
        width: wp("30%"),
        height: hp("5%"),
        justifyContent: "space-evenly",
        alignItems: "center",
        marginLeft: wp("3.5%"),
        borderRadius: wp("3%"),
        flexDirection: "row",
        marginBottom: hp('1%'),
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
    }

});
