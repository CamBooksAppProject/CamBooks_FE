import { StyleSheet, View, TouchableOpacity, Image, SafeAreaView, ScrollView, FlatList, Text } from 'react-native';
import React from 'react';



import IMAGES from '../../../assets';

const DATA = new Array(5).fill(0).map((_, index) => ({ id: index }));


export default function NotificationPage({ navigation }) {
    return (
        <View style={styles.container}>

            <SafeAreaView />
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

                    data={DATA}
                    renderItem={() => {
                        return (
                            < TouchableOpacity style={styles.listView} onPress={() => navigation.navigate("FreeBoardDetailPage")}>
                                <View style={{ flexDirection: 'row', width: '95%', alignSelf: 'center' }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.title}>댓글이 달렸습니다.</Text>
                                            <Text style={styles.timeFont}>14:54</Text>
                                        </View>
                                        <Text style={styles.contentsFont}>이거 얼마인가요?</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }

                    }
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
        width: '100%',
        height: '10%',
        justifyContent: 'center',
    },
    middleView: {
        backgroundColor: 'white',
        width: '100%',
        height: '90%',
    },
    listView: {
        width: '95%',
        height: 60,
        backgroundColor: 'white',
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#CDCDCD',

    },
    title: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    contentsFont: {
        fontSize: 11,
        color: '#515a5a',
        marginLeft: 15,
        marginTop: 6,
    },
    timeFont: {
        fontSize: 11,
        color: 'gray',
        marginLeft: 200,
    },
});
