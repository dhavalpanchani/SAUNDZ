
import React, { createRef, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
    Modal,
    FlatList,
    TextInput,
    Image
} from 'react-native';
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { color } from '../components/style/colors';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

function SplashScreen({ navigation }) {

    useEffect(() => {

        setTimeout(() => {
            navigation.replace('Home');

        }, 2000)
    })

    return (
        <View style={styles.container}>
            <Image resizeMode='cover' source={require('../assets/images/splash-screen-1.png')} style={styles.image} />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.white
    },
    image: {
        height: DEVICE_HEIGHT,
        width: DEVICE_WIDTH
    }

});

export default SplashScreen;
