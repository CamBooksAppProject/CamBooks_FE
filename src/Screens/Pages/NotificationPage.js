import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { BASE_URL } from '@env';
import IMAGES from '../../../assets';

export default function NotificationPage({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [myUserId, setMyUserId] = useState(null);

    // userId 로드
    const loadMyUserId = async () => {
        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) return;
            setMyUserId(Number(userIdStr));
        } catch (e) {
            console.error("userId 로드 실패:", e);
        }
    };

    // 알림 불러오기
    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.warn("토큰 없음");
                return;
            }

            const res = await fetch(`${BASE_URL}/cambooks/notification`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                console.log("서버 응답 에러:", res.status);
                return;
            }

            const data = await res.json();
            setNotifications(data);
        } catch (error) {
            console.log("fetch error:", error);
        }
    };

    useEffect(() => {
        loadMyUserId();
        fetchNotifications();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listView}
            onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: "FreeBoardDetailPage", params: { id: item.navigateId } }],
            })}
        >
            <View style={styles.row}>
                <Text style={styles.title}>{item.content}</Text>
                <Text style={styles.timeFont}>{item.time}</Text>
            </View>
            <Text style={styles.contentsFont}>공지 타입: {item.noticeTypeId}</Text>
        </TouchableOpacity >
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} />
            <View style={styles.topView}>
                <TouchableOpacity onPress={() => navigation.navigate("RouteScreen")} style={{ marginLeft: 15 }}>
                    <Image
                        source={IMAGES.BACK}
                        resizeMode="contain"
                        tintColor="#474747"
                        style={{ width: 25, height: 25 }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleView}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
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
        backgroundColor: 'white',
        height: hp(5),
        justifyContent: 'center',
    },
    middleView: {
        flex: 1,
    },
    listView: {
        width: '100%',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderBottomWidth: 0.7,
        borderBottomColor: '#e0e0e0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2d3436',
        flexShrink: 1,
        marginLeft: 10,
    },
    contentsFont: {
        fontSize: 12,
        color: '#515a5a',
        marginTop: 4,
        marginLeft: 10,
    },
    timeFont: {
        fontSize: 11,
        color: '#aaa',
        marginLeft: 10,
    },
});
