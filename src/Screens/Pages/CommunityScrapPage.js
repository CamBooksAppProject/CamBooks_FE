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

            const likedPosts = likedData["COMMUNITY"] || [];
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
    emptyText: {
        alignSelf: 'center',
        marginTop: hp(5),
        fontSize: wp(4),
        color: '#999',
    },
});
