import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Linking, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { parse, stringify, toJSON, fromJSON } from 'flatted';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import BackgroundService from 'react-native-background-actions';
import Sound from 'react-native-sound';
import alertSound from '../sounds/warning.mp3';

setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
setUpdateIntervalForType(SensorTypes.gyroscope, 1000);

const Testt = () => {

    const [enb, setEnb] = useState(true);
    const [subscriptionA, setSubscriptionA] = useState(null);
    const [subscriptionG, setSubscriptionG] = useState(null);
    const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });
    const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });

    useEffect(() => {
        const getEnab = async () => {
            try {
                const subA = await AsyncStorage.getItem("subA");
                const subG = await AsyncStorage.getItem("subG");
                if (subA !== null && subG !== null) {
                    const subAA = parse(subA);
                    const subGG = parse(subG);
                    console.log('s', subAA)
                } else {
                    console.log("No saved state");
                }
            } catch (error) {
                console.log("Error getting the state", error);
            }
        };
        getEnab();
    }, []);

    //Background task
    const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

    BackgroundService.on('expiration', () => {
        console.log('I am being closed :(');
    });

    // You can do anything in your task such as network requests, timers and so on,
    // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
    // React Native will go into "paused" mode (unless there are other tasks running,
    // or there is a foreground app).
    const veryIntensiveTask = async (taskDataArguments) => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                {
                    title: 'After Look App Notification Permission',
                    message:
                        'After Look App needs access to your Notification ' +
                        'In order to run the app background.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const { delay } = taskDataArguments;
                await new Promise(async (resolve) => {
                    const subA = accelerometer.subscribe(({ x, y, z, timestamp }) => {
                        setAccelerometerData({ x, y, z, timestamp });
                        console.log(timestamp);
                    });
                    setSubscriptionA(subA);
                    const subG = gyroscope.subscribe(({ x, y, z, timestamp }) => {
                        setGyroscopeData({ x, y, z, timestamp });
                    });
                    setSubscriptionG(subG);
                    try {
                        await AsyncStorage.setItem('subA', stringify(subA));
                        await AsyncStorage.setItem('subG', stringify(subG));
                    } catch (error) {
                        console.log('Error saving state', error);
                    }
                    await BackgroundService.updateNotification({ taskDesc: 'Reading' }); // Only Android, iOS will ignore this call      
                    await sleep(delay);
                });
            } else {
                console.log('Permission denied');
            }
        } catch (err) {
            console.log(err);
        }
    };

    Sound.setCategory('Ambient');

    var whoosh = new Sound(alertSound, error => {
        if (error) {
            console.log('failed to load the sound', error);
            return;
        }
        console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
    });

    const veryIntensiveTask1 = async (taskDataArguments) => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                {
                    title: 'After Look App Notification Permission',
                    message:
                        'After Look App needs access to your Notification ' +
                        'In order to run the app background.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const { delay } = taskDataArguments;
                await new Promise(async (resolve) => {
                    for (let i = 0; BackgroundService.isRunning(); i++) {
                        const snapshot = await firestore()
                            .collection('Users')
                            .doc('a')
                            .get();
                        if (snapshot.exists) {
                            if (snapshot.data().falled === true) {
                                whoosh.play();
                                whoosh.setVolume(1);
                                await BackgroundService.updateNotification({ taskDesc: 'Notif' + snapshot.data().falled }); // Only Android, iOS will ignore this call      
                                await sleep(delay);
                            } else {
                                await BackgroundService.updateNotification({ taskDesc: 'Notif' }); // Only Android, iOS will ignore this call      
                                await sleep(delay);
                            }
                        } else {
                            await BackgroundService.updateNotification({ taskDesc: 'Notif' }); // Only Android, iOS will ignore this call      
                            await sleep(delay);
                        }
                    }
                });
            } else {
                console.log('Permission denied');
            }
        } catch (err) {
            console.log(err);
        }
    };


    const options = {
        taskName: 'After Look',
        taskTitle: 'Getting Sensor Data',
        taskDesc: 'Reading',
        taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
        },
        color: '#ff00ff',
        linkingURI: 'backScheme://chat/jane', // See Deep Linking for more info
        parameters: {
            delay: 1000,
        },
    };

    const startBack = async () => {
        await BackgroundService.start(veryIntensiveTask, options);
    }

    const stopBack = async () => {
        if (subscriptionA) {
            subscriptionA.unsubscribe();
            setSubscriptionA(null);
        }

        if (subscriptionG) {
            subscriptionG.unsubscribe();
            setSubscriptionG(null);
        }
        await BackgroundService.stop();
        whoosh.stop();
    }

    const getNotif = async () => {
        await BackgroundService.start(veryIntensiveTask1, options);
    }

    Linking.addEventListener('url', handleOpenURL);

    function handleOpenURL(evt) {
        // Will be called when the notification is pressed
        console.log(evt.url);
        whoosh.stop();
        // do something
    }
    // 

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Accelerometer:</Text>
            <Text>x: {accelerometerData.x.toFixed(2)}</Text>
            <Text>y: {accelerometerData.y}</Text>
            <Text>z: {accelerometerData.z}</Text>
            <Text>time: {accelerometerData.timestamp}</Text>
            <View style={styles.divider}></View>
            <Text style={styles.title}>Gyroscope:</Text>
            <Text>x: {gyroscopeData.x.toFixed(2)}</Text>
            <Text>y: {gyroscopeData.y}</Text>
            <Text>z: {gyroscopeData.z}</Text>
            <Text>time: {gyroscopeData.timestamp}</Text>
            <View style={styles.divider}></View>
            <Button title="Start" onPress={startBack} />
            <View style={styles.divider}></View>
            <Button title="Stop" onPress={stopBack} />
            <View style={styles.divider}></View>
            <Button title="Get Notification" onPress={getNotif} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center'
    },
    divider: {
        margin: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10
    }
});



export default Testt;