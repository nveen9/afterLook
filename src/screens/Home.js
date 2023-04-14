import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, StatusBar, Switch, Linking, PermissionsAndroid, DevSettings } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parse, stringify, toJSON, fromJSON } from 'flatted';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import BackgroundService from 'react-native-background-actions';
import { TouchableOpacity } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';

setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
setUpdateIntervalForType(SensorTypes.gyroscope, 1000);

const Home = ({ navigation }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [subscriptionA, setSubscriptionA] = useState(null);
  const [subscriptionG, setSubscriptionG] = useState(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });

  useEffect(() => {
    if (!isSignedIn) {
      auth().onAuthStateChanged(user => {
        if (!user) {
          console.log('User not found!');
          setIsSignedIn(false);
        } else {
          console.log('User found!');
          // navigation.navigate('Home');
          setIsSignedIn(true);
        }
      })
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isEnabled) {
      const getEnab = async () => {
        try {
          const enab = await AsyncStorage.getItem("enab");
          if (enab !== null) {
            const enabb = JSON.parse(enab);
            console.log('ee', enabb);
            setIsEnabled(enabb);
          } else {
            console.log("No saved state");
          }
        } catch (error) {
          console.log("Error getting the state", error);
        }
      };
      getEnab();
    }
  }, [isEnabled]);

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
      delay: 1000,
    },
  };
  //

  const toggleSwitch = async () => {
    if (isEnabled) {
      if (subscriptionA) {
        subscriptionA.unsubscribe();
        setSubscriptionA(null);
      }

      if (subscriptionG) {
        subscriptionG.unsubscribe();
        setSubscriptionG(null);
      }
      try {
        await AsyncStorage.setItem('enab', JSON.stringify(!isEnabled));
        await BackgroundService.stop();
        DevSettings.reload();
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      try {
        await AsyncStorage.setItem('enab', JSON.stringify(!isEnabled));
        await BackgroundService.start(veryIntensiveTask, options);
      } catch (error) {
        console.log('Error', error);
      }

    }

    setIsEnabled(previousState => !previousState);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="#2A2E30" />
      <Switch
        style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }], margin: 10 }}
        trackColor={{ false: '#767577', true: '#FFD700' }}
        thumbColor={isEnabled ? '#2A2E30' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <View style={styles.devider}></View>
      <TouchableOpacity title='Signup' onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signUpText}>Signup</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  devider: {
    margin: 10,
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#D1B000',
  },
});

export default Home;