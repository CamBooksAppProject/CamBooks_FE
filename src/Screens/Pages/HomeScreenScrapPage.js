import React, { useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    FlatList,
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import IMAGES from "../../../assets";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

export default function HomeScreenScrapPage() {
    const navigation = useNavigation();
    const [items, setItems] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchScrappedPosts();
        }, [])
    );

    const fetchScrappedPosts = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const likedRes = await fetch(`${BASE_URL}/cambooks/post-likes/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const likedData = await likedRes.json();
            console.log("스크랩 데이터 전체:", likedData);

            const likedPosts = likedData["USED_TRADE"] || [];
            console.log("좋아요 게시글 개수:", likedPosts.length);
            console.log("좋아요 게시글 목록:", likedPosts);

            // id 중복 체크 (경고 로그 출력)
            const ids = likedPosts.map(post => post.id);
            const uniqueIds = new Set(ids);
            if (uniqueIds.size !== ids.length) {
                console.warn("좋아요 게시글 id 중복 감지됨!");
            }

            setItems(likedPosts);
        } catch (error) {
            console.error("스크랩 게시글 불러오기 실패:", error);
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.navigate("HomeDetailPage", { postId: item.id })}
        >
            <View style={{ flexDirection: "row" }}>
                <View style={styles.photo}>
                    {item.thumbnailUrl ? (
                        <Image
                            source={{ uri: `${BASE_URL}${item.thumbnailUrl}` }}
                            style={{ width: "100%", height: "100%", borderRadius: wp(1.5) }}
                            resizeMode="cover"
                        />
                    ) : null}
                </View>
                <View style={styles.textWrapper}>
                    <View style={styles.titleRow}>
                        <Text style={styles.collegeFont}>{item.university}</Text>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                            {item.title}
                        </Text>
                    </View>
                    <Text style={styles.priceFont}>
                        {typeof item.price === "number"
                            ? `${item.price.toLocaleString()}원`
                            : item.price}
                    </Text>
                    <View style={styles.iconRow}>
                        <Image source={IMAGES.REDHEART} style={styles.iconImage} resizeMode="contain" />
                        <Text style={styles.iconFont}>{item.postLikeCount}</Text>
                        <Image source={IMAGES.EYE} style={styles.iconImage} resizeMode="contain" />
                        <Text style={styles.iconFont}>{item.viewCount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>데이터 없음</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    listView: {
        width: wp(92),
        height: hp(11),
        backgroundColor: "white",
        alignSelf: "center",
        justifyContent: "center",
        marginTop: hp(1),
        borderBottomWidth: 0.5,
        borderBottomColor: "#CDCDCD",
    },
    photo: {
        width: wp(18),
        height: wp(18),
        marginLeft: wp(2.5),
        borderColor: "#E9E9E9",
        borderWidth: 1,
        borderRadius: wp(1.5),
        backgroundColor: "gray",
        overflow: "hidden",
    },
    textWrapper: {
        flex: 1,
        marginLeft: wp(3),
        justifyContent: "center",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(0.3),
    },
    collegeFont: {
        fontSize: wp(3),
        fontWeight: "bold",
        color: "gray",
        marginRight: wp(1.5),
    },
    title: {
        fontSize: wp(3.8),
        fontWeight: "600",
        maxWidth: wp(50),
    },
    priceFont: {
        fontSize: wp(4),
        fontWeight: "bold",
        color: "#333",
        marginBottom: hp(0.3),
        marginLeft: hp(1.5),
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp(0.5),
        marginLeft: hp(1.5),
    },
    iconFont: {
        fontSize: wp(2.8),
        fontWeight: "bold",
        color: "gray",
        marginLeft: wp(1.5),
        marginRight: wp(1.5),
    },
    iconImage: {
        height: wp(4),
        width: wp(4),
    },
    emptyText: {
        alignSelf: 'center',
        marginTop: hp(5),
        fontSize: wp(4),
        color: '#999',
    },
});
