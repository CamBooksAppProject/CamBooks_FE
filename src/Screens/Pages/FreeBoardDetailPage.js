import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, Text, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';

import IMAGES from '../../../assets';


export default function FreeBoardDetailPage({ navigation }) {

    const [isHeartFilled, setIsHeartFilled] = useState(true);
    const handleHeartPress = () => {
        setIsHeartFilled(!isHeartFilled);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.navigate("RouteScreen")}
                    style={{ marginLeft: 15, }}>
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: 25, height: 25, }}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.middleView}>
                <ScrollView>



                    <View>
                        <ScrollView>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15, marginTop: 15, }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                        <Image source={IMAGES.POSTPROFILE}
                                            resizeMode='contain'
                                            style={{ height: 25, width: 25, }}>
                                        </Image>
                                        <Text style={styles.nameFont}>홍길동</Text>
                                        <Text style={styles.timeFont}>24/08/31/14:54</Text>
                                        <TouchableOpacity>
                                            <Image source={IMAGES.THREEDOT}
                                                resizeMode='contain'
                                                style={{ height: 13, width: 13, marginLeft: 10 }}>
                                            </Image>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{ padding: 15, paddingBottom: -15, }}>
                                <Text style={styles.titleFont}>
                                    슈슈퍼퍼
                                </Text>
                            </View>

                            <View style={{ padding: 15, }}>
                                <Text style={styles.contentsFont}>
                                    사건은 다가와, ah-oh, ayy 거세게 커져가, ah-oh, ayy That tick, that tick, tick bomb That tick, that tick, tick bomb
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginRight: 20,
                                marginTop: 25,
                            }}>

                                <TouchableOpacity style={styles.heartBtnView} onPress={handleHeartPress}>
                                    <Image
                                        source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                                        resizeMode="contain"
                                        style={{ width: 20, height: 20, }}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.line}></View>

                            <View style={styles.commentView}>

                                <Image source={IMAGES.POSTPROFILE}
                                    resizeMode='contain'
                                    tintColor="gray"
                                    style={{ height: 20, width: 20, }}>
                                </Image>
                                <Text style={styles.commentName}>홍길동</Text>
                                <Text style={styles.commentFont}>에스파에스파</Text>
                                <View style={{ marginLeft: 150 }}>
                                    <TouchableOpacity style={{ marginLeft: 10 }}>
                                        <Image source={IMAGES.THREEDOT}
                                            resizeMode='contain'
                                            style={{ height: 11, width: 11 }}>
                                        </Image>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                        <Image source={IMAGES.GOOD}
                                            resizeMode='contain'
                                            style={{ height: 9, width: 9 }}>
                                        </Image>
                                        <Text style={styles.goodFont}>4</Text>
                                    </View>
                                </View>


                            </View>

                            <View style={styles.commentView}>

                                <Image source={IMAGES.POSTPROFILE}
                                    resizeMode='contain'
                                    tintColor="gray"
                                    style={{ height: 20, width: 20, }}>
                                </Image>
                                <Text style={styles.commentName}>홍길동</Text>
                                <Text style={styles.commentFont}>에스파에스파</Text>
                                <View style={{ marginLeft: 150 }}>
                                    <TouchableOpacity style={{ marginLeft: 10 }}>
                                        <Image source={IMAGES.THREEDOT}
                                            resizeMode='contain'
                                            style={{ height: 11, width: 11 }}>
                                        </Image>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                        <Image source={IMAGES.GOOD}
                                            resizeMode='contain'
                                            style={{ height: 9, width: 9 }}>
                                        </Image>
                                        <Text style={styles.goodFont}>4</Text>
                                    </View>
                                </View>


                            </View>


                            <View style={styles.commentView}>

                                <Image source={IMAGES.POSTPROFILE}
                                    resizeMode='contain'
                                    tintColor="gray"
                                    style={{ height: 20, width: 20, }}>
                                </Image>
                                <Text style={styles.commentName}>홍길동</Text>
                                <Text style={styles.commentFont}>에스파에스파</Text>
                                <View style={{ marginLeft: 150 }}>
                                    <TouchableOpacity style={{ marginLeft: 10 }}>
                                        <Image source={IMAGES.THREEDOT}
                                            resizeMode='contain'
                                            style={{ height: 11, width: 11 }}>
                                        </Image>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                        <Image source={IMAGES.GOOD}
                                            resizeMode='contain'
                                            style={{ height: 9, width: 9 }}>
                                        </Image>
                                        <Text style={styles.goodFont}>4</Text>
                                    </View>
                                </View>


                            </View>




                        </ScrollView>
                    </View>




                </ScrollView>

            </View>
            <View style={styles.bottomView}>
                <View style={styles.inputView}>
                    <View style={styles.input}>
                        <TextInput
                            style={styles.input}
                            placeholder="댓글을 입력하세요.">
                        </TextInput>
                    </View>
                    <TouchableOpacity style={styles.sendBtnView}>
                        <Image
                            source={IMAGES.SEND}
                            resizeMode="contain"
                            tintColor="white"
                            style={{ width: 25, height: 25, }}
                        />
                    </TouchableOpacity>
                </View>

            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topView: {
        backgroundColor: 'white',
        width: '100%',
        height: '10%',
        justifyContent: 'center',
        // borderBottomWidth: 0.5,
        // borderBottomColor: 'gray',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: '73%',
    },
    nameFont: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    titleFont: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentsFont: {
        fontSize: 15,
        lineHeight: 23,
    },
    timeFont: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 190,
    },
    bottomView: {
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        height: '9%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderTopWidth: 0.5,
        borderTopColor: 'gray',
    },
    photoView: {
        flexDirection: 'row',
        width: '100%',
        height: 200,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
    heartBtnView: {
        backgroundColor: 'white',
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderColor: 'gray',
        borderWidth: 0.2,
        borderRadius: 12,
    },
    line: {
        marginTop: 15,
        marginBottom: 15,
        alignSelf: 'center',
        width: '95%',
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
    },
    commentView: {
        margin: 1,
        width: '85%',
        height: 45,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#F9F9F9',
        alignItems: 'center'
    },
    commentName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'gray',
        marginLeft: 10,
    },
    commentFont: {
        fontSize: 14,
        color: 'gray',
        marginLeft: 20,

    },
    goodFont: {
        marginLeft: 5,
        fontSize: 11,
        color: 'gray',
    },
    inputView: {
        width: '85%',
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#F9F9F9',
        width: '85%',
        height: 45,
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    sendBtnView: {
        backgroundColor: '#67574D',
        width: '15%',
        height: 45,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    chatFont: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    }

});
