import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    FlatList,
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import IMAGES from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function CommunScreen() {
    const navigation = useNavigation();
    const [items, setItems] = useState([]);
    const BASE_URL = 'http://localhost:8080';

    useFocusEffect(
        useCallback(() => {
            fetchScrappedPosts();
        }, [])
    );


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}.${month}.${day}`;
    };

    const fetchCommentCount = async (postId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`http://localhost:8080/cambooks/community/comment/count?postId=${postId}`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            if (!res.ok) throw new Error('댓글 수 조회 실패');
            const count = await res.json();
            return count;
        } catch (err) {
            console.error(`댓글 수 조회 실패 postId:${postId}`, err);
            return 0;
        }
    };

    const fetchScrappedPosts = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("로그인이 필요합니다.");

            const likedRes = await fetch(`${BASE_URL}/cambooks/post-likes/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!likedRes.ok) throw new Error(`HTTP error! status: ${likedRes.status}`);
            const likedData = await likedRes.json();

            const likedPosts = likedData["COMMUNITY"] || [];

            // id 중복 체크
            const ids = likedPosts.map(post => post.id);
            const uniqueIds = new Set(ids);
            if (uniqueIds.size !== ids.length) {
                console.warn("좋아요 게시글 id 중복 감지됨!");
            }

            // 로컬에 저장된 스크랩 정보 키 조회 (예: scrapped_community_게시글id)
            const keys = await AsyncStorage.getAllKeys();
            const scrappedKeys = keys.filter(key => key.startsWith('scrapped_community_'));
            const entries = await AsyncStorage.multiGet(scrappedKeys);
            const scrappedPostIds = entries
                .filter(([_, value]) => value === 'true')
                .map(([key]) => parseInt(key.replace('scrapped_community_', '')));

            // 각 게시글에 댓글 수와 로컬 스크랩 상태 추가
            const merged = await Promise.all(
                likedPosts.map(async (post) => {
                    const isScrapped = scrappedPostIds.includes(post.id);
                    const commentCount = await fetchCommentCount(post.id);  // 댓글 수 가져오는 함수

                    return {
                        ...post,
                        isScrapped,
                        commentCount,
                    };
                })
            );

            setItems(merged);
        } catch (error) {
            console.error("스크랩 게시글 불러오기 실패:", error);
        }
    };



    const renderItem = ({ item }) => {
        const heartImage = item.isLiked ? IMAGES.REDHEART : IMAGES.EMPTYHEART;

        return (
            <TouchableOpacity
                style={styles.listView}
                onPress={() => navigation.navigate('CommuDetailPage', { postId: item.id })}
            >
                <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                        {item.thumbnailUrl ? (
                            <Image
                                source={{ uri: `${BASE_URL}${item.thumbnailUrl}` }}
                                style={styles.photo}
                            />
                        ) : (
                            <View style={styles.photo} />
                        )}
                        <Image
                            source={heartImage}
                            resizeMode="contain"
                            style={styles.heartIcon}
                        />
                    </View>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {item.title}
                    </Text>
                    <Text style={styles.contentsFont} numberOfLines={2} ellipsizeMode="tail">
                        {item.recruitment}
                    </Text>
                    <View style={styles.peopleRow}>
                        <Image source={IMAGES.PEOPLE} resizeMode="contain" style={styles.peopleIcon} />
                        <Text style={styles.iconFont}>{item.currentParticipants}</Text>
                        <Image source={IMAGES.COMMENT} resizeMode="contain" style={[styles.peopleIcon, { marginLeft: wp(2) }]} />
                        <Text style={styles.iconFont}>{item.commentCount ?? 0}</Text>
                        <Text style={styles.dateFont}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                columnWrapperStyle={{
                    justifyContent: 'flex-start',
                    gap: wp(4),
                    paddingHorizontal: wp(5),
                    paddingTop: hp(2),
                }}
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
        backgroundColor: '#FFFFFF',
    },
    listView: {
        width: wp(42),
        height: hp(21),
        backgroundColor: 'white',
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: '#CDCDCD',
        marginBottom: hp(1.5),
    },
    photo: {
        width: wp(18),
        height: wp(18),
        margin: wp(3),
        borderColor: '#D0D1D1',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#F0F0F0',
    },
    heartIcon: {
        height: wp(5),
        width: wp(5),
        marginTop: wp(7),
        marginLeft: wp(8),
    },
    title: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        marginLeft: wp(4),
        marginTop: hp(0.5),
    },
    contentsFont: {
        width: wp(32),
        fontSize: wp(2.5),
        color: '#515a5a',
        marginLeft: wp(4),
        marginTop: hp(0.5),
    },
    iconFont: {
        fontSize: wp(2.8),
        fontWeight: 'bold',
        marginLeft: wp(1),
    },
    peopleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(1),
        marginLeft: wp(4),
    },
    peopleIcon: {
        height: wp(3),
        width: wp(3),
    },
    dateFont: {
        fontSize: wp(2.6),
        color: '#7f8c8d',
        marginLeft: wp(2),
    },
    emptyText: {
        alignSelf: 'center',
        marginTop: hp(5),
        fontSize: wp(4),
        color: '#999',
    },
});
