import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../../assets';

export default function SearchingPage({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={IMAGES.BACK} resizeMode="contain" style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>검색 화면입니다.</Text>
                <View style={{ width: 30 }} />
                {/* 뒤로가기 버튼 크기만큼 공간 확보용 */}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    backIcon: {
        width: 30,
        height: 30,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});
