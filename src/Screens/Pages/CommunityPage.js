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

export default function CommunScreen() {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([
        {
            id: 1,
            title: 'LG 부트캠프 모집',
            content: '소프트웨어 인재를 양성할 목적으로 설립한 교육기관...',
            peopleCount: 9,
        }
    ]);

    useEffect(() => {
        // fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('https://your.api.endpoint.com/community');
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('API 호출 실패:', error);
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.navigate('CommuDetailPage')}
        >
            <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={styles.photo}></View>
                    <Image
                        source={IMAGES.REDHEART}
                        resizeMode='contain'
                        style={styles.heartIcon}
                    />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.contentsFont}>{item.content}</Text>
                <View style={styles.peopleRow}>
                    <Image
                        source={IMAGES.PEOPLE}
                        resizeMode='contain'
                        style={styles.peopleIcon}
                    />
                    <Text style={styles.iconFont}>{item.peopleCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
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
                    resizeMode='contain'
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
    },
    contentsFont: {
        width: wp(32),
        fontSize: wp(2.5),
        color: '#515a5a',
        marginLeft: wp(4),
        marginTop: hp(1),
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
