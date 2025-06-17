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

export default function HomeScreenScrapPage() {
    const navigation = useNavigation();

    const [posts, setPosts] = useState([
        {
            id: 1,
            college: '서울대',
            title: '전공책 5개 팝니다~',
            price: '30,000원',
            likes: 30,
            views: 50,
            isScrapped: true,
        },
        {
            id: 2,
            college: '고려대',
            title: '기초 통계학 교재',
            price: '10,000원',
            likes: 12,
            views: 25,
            isScrapped: false,
        },
    ]);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => post.isScrapped === true);
    }, [posts]);

    useEffect(() => {
        // fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('https://your.api.endpoint.com/posts');
            const data = await response.json();
            const scrapped = data.filter(item => item.isScrapped);
            setPosts(scrapped);
        } catch (error) {
            console.error('API 통신 오류:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.navigate('HomeDetailPage')}
        >
            <View style={{ flexDirection: 'row' }}>
                <View style={styles.photo} />
                <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.collegeFont}>{item.college}</Text>
                        <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <Text style={styles.priceFont}>{item.price}</Text>
                    <View style={styles.iconRow}>
                        <Image source={IMAGES.REDHEART} style={styles.iconImage} resizeMode="contain" />
                        <Text style={styles.iconFont}>{item.likes}</Text>
                        <Image source={IMAGES.EYE} style={styles.iconImage} resizeMode="contain" />
                        <Text style={styles.iconFont}>{item.views}</Text>
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
                ListEmptyComponent={
                    <Text style={styles.emptyText}>스크랩한 중고거래가 없습니다.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    listView: {
        width: wp(92),
        height: hp(11),
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: hp(1),
        borderBottomWidth: 0.5,
        borderBottomColor: '#CDCDCD',
    },
    photo: {
        width: wp(18),
        height: wp(18),
        marginLeft: wp(2.5),
        borderColor: '#E9E9E9',
        borderWidth: 1,
        borderRadius: wp(1.5),
        backgroundColor: 'orange',
    },
    collegeFont: {
        fontSize: wp(3),
        fontWeight: 'bold',
        color: 'gray',
        marginLeft: wp(3),
    },
    title: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        marginLeft: wp(2),
    },
    priceFont: {
        fontSize: wp(3.3),
        marginLeft: wp(3),
        marginTop: hp(0.5),
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(3),
        marginTop: hp(0.8),
    },
    iconFont: {
        fontSize: wp(2.8),
        fontWeight: 'bold',
        color: 'gray',
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
