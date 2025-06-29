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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommunScreen() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const BASE_URL = 'http://localhost:8080';

    const regions = [
        '전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산',
        '세종', '제주', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남',
    ];

    const regionMap = {
        '전체': null,
        '서울': 'SEOUL',
        '부산': 'BUSAN',
        '대구': 'DAEGU',
        '인천': 'INCHEON',
        '광주': 'GWANGJU',
        '대전': 'DAEJEON',
        '울산': 'ULSAN',
        '세종': 'SEJONG',
        '제주': 'JEJU',
        '경기': 'GYEONGGI',
        '강원': 'GANGWON',
        '충북': 'CHUNGBUK',
        '충남': 'CHUNGNAM',
        '전북': 'JEONBUK',
        '전남': 'JEONNAM',
        '경북': 'GYEONGBUK',
        '경남': 'GYEONGNAM',
    };

    useEffect(() => {
        if (selectedRegion === '전체') {
            setFilteredPosts(posts);
        } else {
            const regionCode = regionMap[selectedRegion];
            const filtered = posts.filter(post => post.region === regionCode);
            setFilteredPosts(filtered);
        }
    }, [selectedRegion, posts]);

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

    const fetchData = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error("로그인이 필요합니다.");

            const response = await fetch("http://localhost:8080/cambooks/community", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const postList = Array.isArray(data) ? data : data.posts || [];

            const keys = await AsyncStorage.getAllKeys();
            const likedKeys = keys.filter(key => key.startsWith('liked_community_'));
            const entries = await AsyncStorage.multiGet(likedKeys);

            const likedPostIds = entries
                .filter(([_, value]) => value === 'true')
                .map(([key]) => parseInt(key.replace('liked_community_', '')));

            const merged = await Promise.all(
                postList.map(async (post) => {
                    const isLiked = likedPostIds.includes(post.id);
                    const commentCount = await fetchCommentCount(post.id);
                    return {
                        ...post,
                        isLiked,
                        commentCount,
                    };
                })
            );

            setPosts(merged);
        } catch (error) {
            console.error("API 통신 오류:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

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
            <View style={{ height: hp(3), paddingHorizontal: wp(5.5), marginTop: hp(1) }}>
                <FlatList
                    data={regions}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedRegion(item)}
                            style={[
                                styles.regionButton,
                                selectedRegion === item && styles.regionButtonSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.regionText,
                                    selectedRegion === item && styles.regionTextSelected,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filteredPosts}
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

            <TouchableOpacity
                style={styles.additBtn}
                onPress={() => navigation.navigate('CommuPostPage')}
            >
                <Image
                    source={IMAGES.PLUS}
                    resizeMode="contain"
                    style={styles.addIcon}
                />
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    regionButton: {
        width: wp(15),
        height: hp(3),
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
        marginRight: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
    },

    regionButtonSelected: {
        backgroundColor: '#555',
    },

    regionText: {
        fontSize: wp(3.5),
        color: '#555',
    },

    regionTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
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

    additBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: wp(14),
        height: wp(14),
        backgroundColor: '#59B283',
        borderRadius: wp(14) / 2,
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        position: 'absolute',
        bottom: hp(4),
        right: wp(6),
    },

    addIcon: {
        height: wp(6),
        width: wp(6),
    },

    emptyText: {
        alignSelf: 'center',
        marginTop: hp(5),
        fontSize: wp(4),
        color: '#999',
    },
});
