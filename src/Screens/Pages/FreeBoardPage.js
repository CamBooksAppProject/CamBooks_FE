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
import { BASE_URL } from '@env';

export default function FreeBoardPage() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    const fetchPosts = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            const response = await fetch(`${BASE_URL}/cambooks/general-forum`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('불러오기 실패:', errText);
                return;
            }

            const data = await response.json();

            const postsWithCommentCount = await Promise.all(
                data.map(async (post) => {
                    const commentCount = await fetchCommentCount(post.id);
                    return { ...post, commentCount };
                })
            );

            setPosts(postsWithCommentCount);
        } catch (err) {
            console.error('게시글 불러오기 실패:', err);
        }
    };

    const fetchCommentCount = async (postId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const res = await fetch(`${BASE_URL}/cambooks/general-forum/comment/count?postId=${postId}`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            if (!res.ok) throw new Error('댓글 수 조회 실패');
            const count = await res.json();
            return count; // 숫자 반환
        } catch (err) {
            console.error(`댓글 수 조회 실패 postId:${postId}`, err);
            return 0;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.navigate('FreeBoardDetailPage', { postId: item.id })}
        >
            <View style={{ flexDirection: 'column' }}>
                <Text style={styles.title}>{item.title ?? ''}</Text>
                <Text style={styles.contentsFont} numberOfLines={2}>{item.content ?? ''}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.userInfo}>
                        <Image
                            source={IMAGES.POSTPROFILE}
                            resizeMode="contain"
                            style={styles.profileIcon}
                        />
                        <Text style={styles.nameFont}>{item.writerName ?? ''}</Text>
                        <Text style={styles.timeFont}>{item.createdAt ? item.createdAt.split('T')[0] : ''}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <Image source={IMAGES.REDHEART} resizeMode="contain" style={styles.icon} />
                        <Text style={styles.iconFont}>{String(item.postLikeCount ?? 0)}</Text>

                        <Image source={IMAGES.COMMENT} resizeMode="contain" style={styles.icon} />
                        <Text style={styles.iconFont}>{String(item.commentCount ?? 0)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: hp(14) }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>데이터 없음</Text>
                }
            />

            <TouchableOpacity
                style={styles.additBtn}
                onPress={() => navigation.navigate('FreeBoardPostPage')}
            >
                <Image
                    source={IMAGES.PLUS}
                    style={styles.plusIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
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
    additBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: wp(14),
        height: wp(14),
        backgroundColor: '#59B283',
        borderRadius: wp(7),
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        position: 'absolute',
        bottom: hp(4),
        right: wp(6),
    },
    plusIcon: {
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
