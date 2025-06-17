import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, Text, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';

import IMAGES from '../../../assets';

export default function CommuDetailPage({ navigation }) {

    const [isHeartFilled, setIsHeartFilled] = useState(true);
    const [focusedButton, setFocusedButton] = useState('모집공고'); // Track the focused button
    const handleHeartPress = () => {
        setIsHeartFilled(!isHeartFilled);
    };

    const handleButtonPress = (button) => {
        setFocusedButton(button);
    };

    const renderContent = () => {
        if (focusedButton === '모집공고') {
            return (
                <Text style={styles.contentsFont}>
                    LG가 운영하는 KBO 리그의 프로야구단.
                    연고지는 대한민국 수도 서울특별시로, 두산 베어스, 키움 히어로즈와 더불어 서울을 연고지로 삼는 3팀 중 한 팀이다. 그 중에서도 원년 서울 연고팀이며, 전신인 MBC 청룡 시절부터 쭉 서울을 연고로 했기에 3팀 중 가장 오래된 서울 연고 역사를 가지고 있다. 대한민국 프로스포츠 역사상 최초의 서울 연고 구단이라는 타이틀도 가지고 있는 점 때문에 가장 널리 쓰이는 전통의 슬로건이 서울의 자존심.
                </Text>
            );
        } else if (focusedButton === '동아리소개') {
            return (
                <Text style={styles.contentsFont}>
                    동아리소개 내용이 여기에 표시됩니다.
                    동아리에 대한 자세한 설명과 활동내용 등을 여기에 작성하세요.
                </Text>
            );
        }
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
                                <View style={styles.mainView}>

                                    <View style={styles.photo} />
                                    <View style={{ flexDirection: 'column', marginLeft: 15, }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 80,
                                        }}>
                                            <Text style={styles.titleFont}>엘지트윈스</Text>
                                            <TouchableOpacity style={{ marginLeft: 75 }}>
                                                <Image source={IMAGES.THREEDOT}
                                                    resizeMode='contain'
                                                    style={{ height: 12, width: 12 }}>
                                                </Image>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}>
                                            <Image source={IMAGES.PEOPLE}
                                                resizeMode='contain'
                                                style={{ height: 13, width: 13 }}>
                                            </Image>
                                            <Text style={styles.peopleFont}>70</Text>
                                            <Text style={styles.timeFont}>24/08/31/14:54</Text>
                                        </View>

                                    </View>
                                </View>
                            </View>









                            <View style={{ flexDirection: 'row', marginTop: 10, }}>
                                <TouchableOpacity
                                    style={[styles.btn3, focusedButton === '모집공고' && styles.btnFocused]}
                                    onPress={() => handleButtonPress('모집공고')}
                                >
                                    <Text style={[styles.btnText, focusedButton === '모집공고' && styles.btnTextFocused]}>
                                        모집공고
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn3, focusedButton === '동아리소개' && styles.btnFocused]}
                                    onPress={() => handleButtonPress('동아리소개')}
                                >
                                    <Text style={[styles.btnText, focusedButton === '동아리소개' && styles.btnTextFocused]}>
                                        동아리소개
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ padding: 15, }}>
                                {renderContent()}
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 25,
                            }}>
                                <TouchableOpacity style={{ marginLeft: 20, }}>
                                    <Text style={{ fontSize: 11, color: 'gray', }}>신고하기</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btn2}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>참가하기</Text>
                                </TouchableOpacity>

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
                                <Text style={styles.commentFont}>무!적!엘!지!</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    mainView: {
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        width: '95%',
        height: 200,
        flexDirection: 'row',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 15,
    },
    photo: {
        width: 150,
        height: 150,
        borderRadius: 10,
        backgroundColor: '#A50034',
    },
    peopleFont: {
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    btn3: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 28,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: '#D0D1D1',
        alignSelf: 'center',
    },
    btn2: {
        marginLeft: 190,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 28,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: '#67574D',
        borderColor: '#D0D1D1',
        alignSelf: 'center',
    },
    btnFocused: {
        backgroundColor: '#67574D',
        borderColor: '#D0D1D1',
        borderWidth: 1,
        borderRadius: 10,
    },
    btnText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'black',
    },
    btnTextFocused: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'white',
    },
    topView: {
        backgroundColor: 'white',
        width: '100%',
        height: '10%',
        justifyContent: 'center',
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
        marginLeft: 60,
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
