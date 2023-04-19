import React from 'react';
import { View, StyleSheet, Image, Text, StatusBar } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnBoarding = ({ navigation }) => {
    const onBoardData = [
        {
            key: 1,
            title: 'Read',
            description: 'AfterLook Reads You Every Time',
            image: require('../assets/onBoarding/walking.png'),
        },
        {
            key: 2,
            title: 'Detect',
            description: 'Detect Any Kind of Fall even when You are Moving',
            image: require('../assets/onBoarding/fall.png'),
        },
        {
            key: 3,
            title: 'Alert',
            description: 'Immediately Alert to the Caregiver by SMS along with Location & the Time',
            image: require('../assets/onBoarding/alert.png'),
        }
    ]

    return (
        <>
            <StatusBar translucent backgroundColor="#fff" />
            <AppIntroSlider
                data={onBoardData}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.container}>
                            <Image style={styles.img} source={item.image} />
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    )
                }}
                activeDotStyle={styles.dot}
                showSkipButton
                renderNextButton={() => {
                    return (
                        <View style={styles.btnView}>
                            <Text style={styles.btnTxt}>
                                Next
                            </Text>
                        </View>
                    )
                }}
                renderSkipButton={() => {
                    return (
                        <View style={styles.btnView}>
                            <Text style={styles.btnTxt}>
                                Skip
                            </Text>
                        </View>
                    )
                }}
                renderDoneButton={() => {
                    return (
                        <View style={styles.btnView}>
                            <Text style={styles.btnTxt}>
                                Done
                            </Text>
                        </View>
                    )
                }}
                onDone={async () => {
                    try {
                        await AsyncStorage.setItem('onboard', JSON.stringify(true));
                        navigation.navigate('TabNav');
                    } catch (error) {
                        console.log('Error', error);
                    }
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        paddingTop: 100,
    },
    img: {
        width: '100%',
        height: '50%',
        resizeMode: 'contain',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 10,
        color: '#2A2E30',
    },
    description: {
        textAlign: 'center',
        fontSize: 15,
        marginTop: 10,
        color: '#2A2E30',
    },
    dot: {
        backgroundColor: '#2A2E30',
        width: 20,
    },
    btnView: {
        padding: 12
    },
    btnTxt: {
        color: '#2A2E30',
        fontSize: 18,
        fontWeight: 'bold',
    },
});


export default OnBoarding;