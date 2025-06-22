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

export default function HomeDetailPage({ navigation, route }) {
    const { postId } = route.params; // 네비게이션에서 전달된 게시글 ID
    const [post, setPost] = useState(null);
    const [isHeartFilled, setIsHeartFilled] = useState(false);

    useEffect(() => {
        fetchPostDetail();
    }, []);

    const fetchPostDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            if (!token) {
                throw new Error("로그인이 필요합니다.");
            }

            const response = await fetch(
                `http://localhost:8080/cambooks/used-trade/${postId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            setPost(data);
            setIsHeartFilled(data.isLiked || false);
        } catch (error) {
            console.error("상세 API 오류:", error);
        }
    };



    const handleHeartPress = () => {
        setIsHeartFilled(!isHeartFilled);
        // TODO: 좋아요 API 호출 등 추가 가능
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
                            {(post.images && post.images.length > 0
                                ? post.images
                                : [""]).map((uri, index) =>
                                    uri ? (
                                        <Image
                                            key={index}
                                            source={{ uri }}
                                            style={styles.photo}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View
                                            key={index}
                                            style={[styles.photo, { backgroundColor: "orange" }]}
                                        />
                                    )
                                )}
                        </ScrollView>
                    </View>

                    <View style={{ padding: 15 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 10,
                            }}
                        >
                            <Image
                                source={IMAGES.POSTPROFILE}
                                resizeMode="contain"
                                style={{ height: 15, width: 15 }}
                            />
                            <Text style={styles.nameFont}>{post.authorName}</Text>
                            <Text style={styles.collegeFont}>{post.college}</Text>
                            <TouchableOpacity>
                                <Image
                                    source={IMAGES.THREEDOT}
                                    resizeMode="contain"
                                    style={{ height: 13, width: 13, marginLeft: "auto" }}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.titleFont}>{post.title}</Text>
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
                            <Text style={styles.iconFont}>{post.likes}</Text>
                            <Image
                                source={IMAGES.EYE}
                                resizeMode="contain"
                                style={{ height: 17, width: 17, marginLeft: 15 }}
                            />
                            <Text style={styles.iconFont}>{post.views}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.heartBtnView} onPress={handleHeartPress}>
                    <Image
                        source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                        resizeMode="contain"
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.priceFont}>
                        {typeof post.price === "number"
                            ? `${post.price.toLocaleString()}원`
                            : post.price}
                    </Text>
                    {post.lowestPrice && (
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text style={styles.lowPriceFont}>네이버쇼핑 최저가: </Text>
                            <Text style={styles.lowPriceFont}>
                                {post.lowestPrice.toLocaleString()}원
                            </Text>
                        </View>
                    )}
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
        backgroundColor: "white",
        width: "100%",
        height: "10%",
        justifyContent: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "gray",
    },
    middleView: { backgroundColor: "white", width: "100%", height: "73%" },
    nameFont: { fontSize: 13, fontWeight: "bold", marginLeft: 5 },
    titleFont: { fontSize: 17, fontWeight: "bold", marginBottom: 10 },
    contentsFont: { fontSize: 15, lineHeight: 23 },
    collegeFont: { fontSize: 12, color: "gray", marginLeft: 5 },
    iconFont: {
        fontSize: 15,
        fontWeight: "bold",
        color: "gray",
        marginLeft: 5,
    },
    bottomView: {
        flexDirection: "row",
        backgroundColor: "white",
        width: "100%",
        height: "9%",
        alignItems: "center",
        justifyContent: "space-evenly",
        borderTopWidth: 0.5,
        borderTopColor: "gray",
    },
    photoView: {
        flexDirection: "row",
        width: "100%",
        height: 200,
        borderBottomColor: "gray",
        borderBottomWidth: 0.5,
    },
    photo: { width: 200, height: 200, marginRight: 5 },
    heartBtnView: {
        backgroundColor: "white",
        width: 35,
        height: 35,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        borderColor: "gray",
        borderWidth: 0.2,
        borderRadius: 12,
    },
    priceFont: { fontSize: 17, fontWeight: "bold" },
    lowPriceFont: { fontSize: 12, fontWeight: "bold" },
    chatBtnView: {
        backgroundColor: "#67574D",
        width: 135,
        height: 45,
        justifyContent: "space-evenly",
        alignItems: "center",
        marginLeft: 15,
        borderRadius: 12,
        flexDirection: "row",
    },
    chatFont: { color: "white", fontSize: 20, fontWeight: "bold" },
});
