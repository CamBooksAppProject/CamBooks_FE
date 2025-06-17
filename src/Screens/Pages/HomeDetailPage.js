import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';

import IMAGES from '../../../assets';


export default function HomeDetailPage({ navigation }) {

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

                    <View style={styles.photoView}>
                        <ScrollView horizontal>
                            <View style={[styles.photo, { backgroundColor: 'orange' }]}></View>
                            <View style={[styles.photo, { backgroundColor: 'teal' }]}></View>
                            <View style={[styles.photo, { backgroundColor: 'yellow' }]}></View>

                        </ScrollView>
                    </View>

                    <View>
                        <ScrollView>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15, marginTop: 15, }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                        <Image source={IMAGES.POSTPROFILE}
                                            resizeMode='contain'
                                            style={{ height: 15, width: 15, }}>
                                        </Image>
                                        <Text style={styles.nameFont}>홍길동</Text>
                                        <Text style={styles.collegeFont}>서울대</Text>
                                        <TouchableOpacity>
                                            <Image source={IMAGES.THREEDOT}
                                                resizeMode='contain'
                                                style={{ height: 13, width: 13, marginLeft: 250 }}>
                                            </Image>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{ padding: 15, paddingBottom: -15, }}>
                                <Text style={styles.titleFont}>
                                    프론트엔드란..?
                                </Text>
                            </View>

                            <View style={{ padding: 15, }}>
                                <Text style={styles.contentsFont}>
                                    분별하기 헷갈리는 직종으로 웹 퍼블리셔가 있는데, 웹 퍼블리셔(해외에서는 UI 개발자로 불린다)는 HTML 중심이거나, 서버 사이드가 감싸는 구조 형태의 웹을 지향하는 웹 퍼블리셔와 개발자의 업무 스타일의 직군으로서 웹표준 반응형 웹과 UI를 만드는 디자인 쪽에 가깝기에 데이터 처리, 비즈니스 로직을 개발하진 않는다. 요즘은 마크업 개발자라고 불린다. 클라이언트 사이드 영역이기도 하지만, 프론트엔드 개발자는 프론트엔드, 백엔드의 완전한 분리 구조를 지향하는 업무 스타일의 직군으로서 웹 퍼블리셔와 같이 인터페이스의 디자인 관점도 있지만, 웹 퍼블리셔와 달리 DOM 조작이 아닌 컴포넌트 아키텍처와 데이터 상태의 변화로 처리하며, 이벤트나 서버와 API 통신해서 비즈니스 로직을 푸는 관점을 가장 중시한다.
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginRight: 20,
                                marginTop: 25,
                            }}>

                                <Image source={IMAGES.HEART}
                                    resizeMode='contain'
                                    tintColor="lightgray"
                                    style={{ height: 15, width: 15, }}>
                                </Image>
                                <Text style={styles.iconFont}>8</Text>
                                <Image source={IMAGES.EYE}
                                    resizeMode='contain'
                                    style={{ height: 17, width: 17, }}>
                                </Image>
                                <Text style={styles.iconFont}>32</Text>
                            </View>
                        </ScrollView>
                    </View>




                </ScrollView>

            </View>
            <View style={styles.bottomView}>
                <TouchableOpacity style={styles.heartBtnView} onPress={handleHeartPress}>
                    <Image
                        source={isHeartFilled ? IMAGES.REDHEART : IMAGES.EMPTYHEART}
                        resizeMode="contain"
                        style={{ width: 20, height: 20, }}
                    />
                </TouchableOpacity>
                <View style={{ marginLeft: 10, }}>
                    <Text style={styles.priceFont}>45,000원</Text>
                    <View style={{ flexDirection: 'row', marginTop: 5, }}>
                        <Text style={styles.lowPriceFont}>네이버쇼핑 최저가:</Text>
                        <Text style={styles.lowPriceFont}>40,000원</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.chatBtnView}>
                    <Image
                        source={IMAGES.CHAT}
                        resizeMode="contain"
                        tintColor="white"
                        style={{ width: 30, height: 30, }}
                    />
                    <Text style={styles.chatFont}>채팅하기</Text>
                </TouchableOpacity>
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
        borderBottomWidth: 0.5,
        borderBottomColor: 'gray',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: '73%',
    }, nameFont: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    titleFont: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    contentsFont: {
        fontSize: 15,
        lineHeight: 23,
    },
    collegeFont: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 5,
    },
    iconFont: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'gray',
        marginLeft: 5,
        marginRight: 5,
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
    photo: {
        width: 200,
        height: 200,
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
    priceFont: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    lowPriceFont: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    chatBtnView: {
        backgroundColor: '#67574D',
        width: 135,
        height: 45,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginLeft: 15,
        borderRadius: 12,
        flexDirection: 'row',
    },
    chatFont: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    }

});
