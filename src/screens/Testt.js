import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

setUpdateIntervalForType(SensorTypes.accelerometer, 500);
setUpdateIntervalForType(SensorTypes.gyroscope, 500);

const Testt = () => {

    const [set, isSet] = useState(true);
    const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });
    const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });

    useEffect(() => {
        if(!set){
        const subscriptionA = accelerometer.subscribe(({ x, y, z, timestamp }) => {
            setAccelerometerData({ x, y, z, timestamp });
        });
        const subscriptionG = gyroscope.subscribe(({ x, y, z, timestamp }) => {
            setGyroscopeData({ x, y, z, timestamp });
        });

        return () => {
            subscriptionA.unsubscribe();
            subscriptionG.unsubscribe();
        }
    }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Accelerometer:</Text>
            <Text>x: {accelerometerData.x.toFixed(2)}</Text>
            <Text>y: {accelerometerData.y}</Text>
            <Text>z: {accelerometerData.z}</Text>
            <Text>time: {accelerometerData.timestamp}</Text>
            <Text style={styles.title}>Gyroscope:</Text>
            <Text>x: {gyroscopeData.x.toFixed(2)}</Text>
            <Text>y: {gyroscopeData.y}</Text>
            <Text>z: {gyroscopeData.z}</Text>
            <Text>time: {gyroscopeData.timestamp}</Text>
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
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10
    }
});

  

export default Testt;