import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
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


export default function FreeBoardPage() {
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

            const likedPosts = likedData["GENERAL_FORUM"] || [];
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
            onPress={() => navigation.navigate('FreeBoardDetailPage', { postId: item.id })}
        >
            <View style={{ flexDirection: 'column' }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.contentsFont} numberOfLines={2}>{item.content}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.userInfo}>
                        <Image
                            source={IMAGES.POSTPROFILE}
                            resizeMode="contain"
                            style={styles.profileIcon}
                        />
                        <Text style={styles.nameFont}>{item.writerName}</Text>
                        <Text style={styles.timeFont}>{item.createdAt?.split('T')[0]}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <Image
                            source={IMAGES.REDHEART}
                            resizeMode="contain"
                            style={styles.icon}
                        />
                        <Text style={styles.iconFont}>{item.postLikeCount ?? 0}</Text>
                        <Image
                            source={IMAGES.COMMENT}
                            resizeMode="contain"
                            style={styles.icon}
                        />
                        <Text style={styles.iconFont}>0</Text>
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
                contentContainerStyle={{ paddingBottom: hp(14) }}
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
        backgroundColor: '#fff',
    },
    listView: {
        width: wp(90),
        paddingVertical: hp(1.5),
        alignSelf: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#CDCDCD',
    },
    title: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        marginLeft: wp(4),
    },
    contentsFont: {
        fontSize: wp(3),
        color: '#515a5a',
        marginLeft: wp(4),
        marginTop: hp(0.5),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(1),
        marginHorizontal: wp(4),
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileIcon: {
        width: wp(4),
        height: wp(4),
    },
    nameFont: {
        fontSize: wp(3),
        marginLeft: wp(1.5),
    },
    timeFont: {
        fontSize: wp(2.5),
        color: 'gray',
        marginLeft: wp(1.5),
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: wp(3),
        height: wp(3),
    },
    iconFont: {
        fontSize: wp(2.5),
        fontWeight: 'bold',
        color: 'gray',
        marginHorizontal: wp(1.5),
    },
    emptyText: {
        alignSelf: 'center',
        marginTop: hp(5),
        fontSize: wp(4),
        color: '#999',
    },
});
