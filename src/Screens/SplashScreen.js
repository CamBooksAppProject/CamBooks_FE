import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';

import IMAGES from '../../assets';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Image source={IMAGES.SWAPLOGOV2} style={styles.image} />
            {/* <Text style={styles.title}>스왑</Text> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    title: {
        marginTop: 50,
        color: '#1d2950',
        fontSize: 50,
        fontWeight: 'bold'
    }
});