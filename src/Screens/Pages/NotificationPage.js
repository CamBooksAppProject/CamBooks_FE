import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { BASE_URL } from '@env';
import IMAGES from '../../../assets';

const NOTICE_TYPE_MAP = {
    1: "앱 공지",
    2: "채팅 알림",
    3: "중고거래 게시글 알림",
    4: "커뮤니티 게시글 알림",
    5: "커뮤니티 댓글 알림",
    6: "자유게시판 댓글 알림",
};

export default function NotificationPage({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [myUserId, setMyUserId] = useState(null);

    const loadMyUserId = async () => {
        try {
            const userIdStr = await AsyncStorage.getItem('userId');
            if (!userIdStr) return;
            setMyUserId(Number(userIdStr));
        } catch (e) {
            console.error("userId 로드 실패:", e);
        }
    };

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
                if (res.status === 500) {
                    console.log("가져올 데이터 없음");
                } else {
                    console.log("서버 응답 에러:", res.status);
                }
                return;
            }

            const data = await res.json();
            console.log(data)
            setNotifications(data);
        } catch (error) {
            console.log("fetch error:", error);
        }
    };

    const clearNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.warn("토큰 없음");
                return;
            }

            const res = await fetch(`${BASE_URL}/cambooks/notification`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                console.log("삭제 실패:", res.status);
                return;
            }

            // 삭제 성공 시 상태 초기화
            setNotifications([]);
            Alert.alert("알림", "모든 알림이 삭제되었습니다.");
        } catch (error) {
            console.log("삭제 에러:", error);
        }
    };

    const formatCreatedAt = (createdAt) => {
        const date = new Date(createdAt);

        // 한국 시간으로 변환 (UTC → KST)
        const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);

        const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
        const day = String(koreaTime.getDate()).padStart(2, '0');
        const hour = String(koreaTime.getHours()).padStart(2, '0');
        const minute = String(koreaTime.getMinutes()).padStart(2, '0');

        return `${month}월 ${day}일 ${hour}시 ${minute}분`;
    };

    useEffect(() => {
        loadMyUserId();
        fetchNotifications();
    }, []);

    const renderItem = ({ item }) => {
        const typeLabel = NOTICE_TYPE_MAP[item.noticeTypeId] || "기타 알림";

        let targetScreen = null;
        let params = {};

        switch (item.noticeTypeId) {
            case 1:
                targetScreen = "MyInfo";
                break;
            case 2:
                targetScreen = "ChatScreen";
                break;
            case 3:
                targetScreen = "HomeDetailPage";
                params = { postId: item.navigateId };
                break;
            case 4:
            case 5:
                targetScreen = "CommuDetailPage";
                params = { postId: item.navigateId };
                break;
            case 6:
                targetScreen = "FreeBoardDetailPage";
                params = { postId: item.navigateId };
                break;
            default:
                targetScreen = null;
        }

        return (
            <TouchableOpacity
                style={styles.listView}
                onPress={() => {
                    if (targetScreen) {
                        if (item.noticeTypeId === 1 || item.noticeTypeId === 2) {
                            navigation.navigate(targetScreen);
                        } else {
                            navigation.navigate(targetScreen, params);
                        }
                    } else {
                        console.log("이동할 화면 없음:", item.noticeTypeId);
                    }
                }}
            >
                <View style={styles.row}>
                    <Text style={styles.title}>{typeLabel}</Text>
                    <Text style={styles.timeFont}>{formatCreatedAt(item.createdAt)}</Text>
                </View>
                <Text style={styles.contentsFont}>{item.content}</Text>
            </TouchableOpacity>
        );
    };


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

            <View style={styles.clearButtonContainer}>
                <TouchableOpacity onPress={clearNotifications}>
                    <Text style={styles.clearButtonText}>전체 삭제</Text>
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
        height: hp(6),
        justifyContent: 'center',
        paddingHorizontal: wp(4),
    },
    middleView: {
        flex: 1,
    },
    listView: {
        width: wp(100),
        backgroundColor: 'white',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginTop: hp(1),
        marginLeft: wp(2),
    },
    contentsFont: {
        fontSize: wp(3.5),
        fontWeight: '500',
        color: '#2d3436',
        flexShrink: 1,
        marginLeft: wp(2),
    },
    timeFont: {
        fontSize: wp(2.5),
        color: 'gray',
        marginLeft: wp(2),
    },
    clearButtonContainer: {
        paddingHorizontal: wp(4),
        alignItems: 'flex-end',
        backgroundColor: 'white',
    },
    clearButtonText: {
        color: 'gray',
        fontWeight: 'bold',
        fontSize: wp(3.5),
    },
});
