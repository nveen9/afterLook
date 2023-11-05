import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Linking, PermissionsAndroid } from 'react-native';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import BackgroundService from 'react-native-background-actions';
import axios from 'axios';

setUpdateIntervalForType(SensorTypes.accelerometer, 5);
setUpdateIntervalForType(SensorTypes.gyroscope, 5);

const Testt = () => {
    const [subscriptionA, setSubscriptionA] = useState(null);
    const [subscriptionG, setSubscriptionG] = useState(null);
    const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });
    const [accData, setAccData] = useState([]);
    const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });
    const [gyroData, setGyroData] = useState([]);
    const [seconds, setSeconds] = useState(0);
    const [pred, setPred] = useState(false);

    useEffect(() => {
            const predict = async () => {
                const requestBody = {
                    data: accData,
                    gyData: gyroData
                };

                console.log('data:', requestBody);
                setAccData([]);
                setGyroData([]);
                await axios.post('http://127.0.0.1:5000/testt', requestBody)
                    .then(response => {
                        setAccData([]);
                        setGyroData([]);
                        console.log('Response data:', response.data);
                    })
                    .catch(err => {
                        console.error('Error:', err);
                    });
            };

            // Use setInterval to run the predict function every 6 seconds
            const interval = setInterval(() => {
                if (seconds === 6) {
                    console.log('data:');
                    predict();
                    setSeconds(0); // Reset the time to 0
                } else {
                    console.log('data1:');
                    setSeconds(seconds + 1); // Increment the time
                }
            }, 1000); // 1000 milliseconds = 1 second

            return () => {
                // Cleanup: Clear the interval when the component unmounts
                clearInterval(interval);
            };
    }, [seconds, accData]);

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
            setPred(true);
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
                    const subA = accelerometer.subscribe((data) => {
                        setAccData((prevData) => [...prevData, data]);
                        setAccelerometerData(data);
                    });
                    setSubscriptionA(subA);
                    const subG = gyroscope.subscribe((data) => {
                        setGyroData((prevData) => [...prevData, data]);
                        setGyroscopeData(data);
                    });
                    setSubscriptionG(subG);
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
            delay: 5,
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
    }

    Linking.addEventListener('url', handleOpenURL);

    function handleOpenURL(evt) {
        // Will be called when the notification is pressed
        console.log(evt.url);
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