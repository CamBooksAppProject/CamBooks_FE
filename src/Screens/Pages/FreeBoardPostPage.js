import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Text, ScrollView, SafeAreaView, FlatList } from 'react-native';
import IMAGES from '../../../assets';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function FreeBoardPostPage({ navigation }) {
    const [selectedOptions, setSelectedOptions] = useState({
        direct: false,
        delivery: false,
        university: false,
    });

    const [items, setItems] = useState([]);

    useEffect(() => {
        // fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('https://your.api.endpoint.com/posts');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('API 통신 오류:', error);
        }
    };

    const toggleOption = (option) => {
        setSelectedOptions(prevState => ({
            ...prevState,
            [option]: !prevState[option],
        }));
    };

    // API에서 받아온 아이템 제목 렌더링
    const renderItem = ({ item }) => (
        <View style={styles.itemBox}>
            <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.navigate("RouteScreen")} style={{ marginLeft: wp('4%') }}>
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: wp('6%'), height: hp('3%') }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    style={{ marginTop: hp('3%') }}
                    ListHeaderComponent={
                        <>
                            <View style={styles.titleEdit}>
                                <TextInput
                                    style={{ marginLeft: wp('4%'), fontSize: wp('4%') }}
                                    placeholder="제목을 입력하세요."
                                />
                            </View>
                            <View style={styles.contentsEdit}>
                                <TextInput
                                    style={{ padding: wp('4%'), fontSize: wp('3.5%') }}
                                    placeholder="내용을 입력하세요. (500자)"
                                    maxLength={500}
                                    multiline={true}
                                />
                            </View>
                        </>
                    }
                />
            </View>

            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.postBtn}>
                    <Text style={{ fontSize: wp('6%'), fontWeight: 'bold', color: 'white' }}>작성 완료</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topView: {
        height: hp('10%'),
        justifyContent: 'center',
    },
    middleView: {
        flex: 1,
        backgroundColor: 'white',
    },
    bottomView: {
        height: hp('8%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    titleEdit: {
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('6%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
        marginBottom: hp('3%'),
        marginTop: hp('4%'),
    },
    contentsEdit: {
        alignSelf: 'center',
        width: wp('90%'),
        height: hp('40%'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
    },
    postBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('80%'),
        height: hp('5%'),
        backgroundColor: '#67574D',
        borderRadius: 15,
        marginBottom: hp('1%'),
    },
    itemBox: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('4%'),
        width: wp('90%'),
        alignSelf: 'center',
    },
    itemTitle: {
        fontSize: wp('4.5%'),
        color: '#333',
    },
});
