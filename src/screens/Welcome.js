import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, Animated, StatusBar } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Welcome = ({ navigation }) => {
    const [onBoard, setOnBoard] = useState(false);

    useEffect(() => {
        const getOnB = async () => {
            try {
                const enab = await AsyncStorage.getItem("onboard");
                if (enab !== null) {
                    navigation.navigate('TabNav');
                } else {
                    setOnBoard(true);
                    console.log("No saved state");
                }
            } catch (error) {
                console.log("Error getting the state", error);
            }
        };
        getOnB();
    }, []);

    //Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
    });
    //

    if (!onBoard) {
        return null;
    }
    return (
        <>
            <StatusBar translucent backgroundColor="#fff" />
            <View style={styles.container}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Image style={styles.img} source={require('../assets/ic_launcher.png')} />
                    <View style={styles.btnContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate('OnBoarding') }}>
                            <Text style={styles.btnTxt}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    img: {
        width: '100%',
        height: '75%',
        resizeMode: 'contain',
    },
    btnContainer: {
        alignItems: 'center',
    },
    button: {
        alignItems: 'center',
        width: 200,
        height: 50,
        backgroundColor: '#2A2E30',
        padding: 10,
        borderRadius: 50,
    },
    btnTxt: {
        fontSize: 20,
        color: '#fff',
    },
});


export default Welcome;