import React, { useEffect, useState, useMemo } from 'react';
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

export default function FreeBoardScrapPage() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([
        {
            id: 1,
            title: '노트북 추천좀',
            content: '맥북이 좋을까요? 갤북이 좋을까요?',
            author: '이몽룡',
            time: '12:21',
            likes: 4,
            comments: 10,
            isScrapped: true,
        },
        {
            id: 2,
            title: '시험 망함',
            content: '다음 학기 수강신청 준비',
            author: '이순신',
            time: '09:12',
            likes: 2,
            comments: 5,
            isScrapped: false,
        },
    ]);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => post.isScrapped === true);
    }, [posts]);

    useEffect(() => {
        // fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('https://your.api.endpoint.com/freeboard');
            const data = await res.json();
            const filtered = data.filter((post) => post.isScrapped);
            setPosts(filtered);
        } catch (err) {
            console.error('게시글 불러오기 실패:', err);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.navigate('FreeBoardDetailPage', { postId: item.id })}
        >
            <View style={{ flexDirection: 'column' }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.contentsFont}>{item.content}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.userInfo}>
                        <Image source={IMAGES.POSTPROFILE} resizeMode="contain" style={styles.profileIcon} />
                        <Text style={styles.nameFont}>{item.author}</Text>
                        <Text style={styles.timeFont}>{item.time}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <Image source={IMAGES.REDHEART} resizeMode="contain" style={styles.icon} />
                        <Text style={styles.iconFont}>{item.likes}</Text>
                        <Image source={IMAGES.COMMENT} resizeMode="contain" style={styles.icon} />
                        <Text style={styles.iconFont}>{item.comments}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: hp(6) }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>스크랩한 자유게시글이 없습니다.</Text>
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
        textAlign: 'center',
        marginTop: hp(4),
        fontSize: wp(3.5),
        color: '#aaa',
    },
});
