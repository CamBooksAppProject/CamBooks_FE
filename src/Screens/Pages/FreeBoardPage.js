import React, { useEffect, useState } from 'react';
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

export default function FreeBoard() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([
        {
            id: 1,
            title: '노트북 추천좀',
            content: '맥북이 좋을까요? 갤북이 좋을까요?',
            author: '홍길동',
            time: '14:54',
            likes: 8,
            comments: 32,
        },
    ]);

    useEffect(() => {
        // fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('https://your.api.endpoint.com/freeboard');
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            console.error('게시글 불러오기 실패:', err);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.navigate('FreeBoardDetailPage')}
        >
            <View style={{ flexDirection: 'column' }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.contentsFont}>{item.content}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.userInfo}>
                        <Image
                            source={IMAGES.POSTPROFILE}
                            resizeMode="contain"
                            style={styles.profileIcon}
                        />
                        <Text style={styles.nameFont}>{item.author}</Text>
                        <Text style={styles.timeFont}>{item.time}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <Image
                            source={IMAGES.REDHEART}
                            resizeMode="contain"
                            style={styles.icon}
                        />
                        <Text style={styles.iconFont}>{item.likes}</Text>
                        <Image
                            source={IMAGES.COMMENT}
                            resizeMode="contain"
                            style={styles.icon}
                        />
                        <Text style={styles.iconFont}>{item.comments}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: hp(14) }} // 하단 여유 공간
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
});
