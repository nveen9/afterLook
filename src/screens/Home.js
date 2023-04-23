import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, StatusBar, Switch, Linking, PermissionsAndroid, Platform } from "react-native";
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import BackgroundService from 'react-native-background-actions';
import auth from '@react-native-firebase/auth';
import RNExitApp from 'react-native-exit-app';

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

  Linking.addEventListener('url', handleOpenURL);

  function handleOpenURL(evt) {
    // Will be called when the notification is pressed
    console.log(evt.url);
    // do something
  }
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
        Toast.show('App is Stopped', Toast.LONG);
        await AsyncStorage.setItem('enab', JSON.stringify(!isEnabled));
        await BackgroundService.stop();
        RNExitApp.exitApp();
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        if (granted['android.permission.READ_CONTACTS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.SEND_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.POST_NOTIFICATIONS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          try {
            const savedContactsJson = await AsyncStorage.getItem("selectedContacts");
            if (savedContactsJson !== null) {
              const savedContacts = JSON.parse(savedContactsJson);
              if (savedContacts && savedContacts.length > 0) {
                await AsyncStorage.setItem('enab', JSON.stringify(!isEnabled));
                await BackgroundService.start(veryIntensiveTask, options);
                Toast.show('App is Started & Running in Background', Toast.LONG);
              } else {
                console.log('No Contacts Imported');
                Toast.show('No Contacts Imported', Toast.SHORT);
                setIsEnabled(true);
              }
            } else {
              console.log('No Contacts Imported');
              Toast.show('No Contacts Imported', Toast.SHORT);
              setIsEnabled(true);
            }
          } catch (error) {
            console.log("Error getting the state", error);
          }
        } else {
          console.log('Permission denied');
          Toast.show('Permission Denied', Toast.SHORT);
          setIsEnabled(true);
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        }
      } catch (error) {
        console.log('Error', error);
      }

    }

    setIsEnabled(previousState => !previousState);
  }

  const instData = [
    {
      title: 'Internet',
      describe: '\nTo identify the fall and send an alert with the location,\nYour mobile device must remain connected to the internet at all times.',
    },
    {
      title: '\nPermission',
      describe: '\nGranting access to permissions does not involve providing data to third parties.\n\nTo ensure proper functionality of the app, it is necessary to grant access to Location, Contacts, SMS, and Notification permissions.\n\nIf any of the above-mentioned permissions are denied, the fall identification feature will not be enabled and direct you to the App settings.\n\nIf you directed to the App settings, you must manually enable the permissions, as the app will not prompt you again for permission.',
    },
    {
      title: '\nContacts',
      describe: '\nTo alert the Caregiver, it is necessary to Import at least one contact to the App.',
    },
    {
      title: '\nRegister',
      describe: '\nRegistration is not required if you are only using SMS alerts.\n\nTo alert the Caregiver by an App notification, both need to register to the System.\n\nCaregiver able to Make a loud siren noise in Faller Device.',
    },
  ]

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
      <ScrollView style={styles.sView}>
        <Text style={styles.header}>Instructions</Text>
        <Text style={styles.hDesc}>Read the following instructions before enabling the App</Text>
        <View style={styles.devider}></View>
        {instData.map((item, index) => (
          <React.Fragment key={index}>
            <Text style={styles.titl}>{item.title}</Text>
            <Text style={styles.txt}>{item.describe}</Text>
          </React.Fragment>
        ))}
      </ScrollView>
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
  sView: {
    marginHorizontal: 10,
    marginBottom: 50,
  },
  header: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 25,
    color: '#2A2E30',
  },
  hDesc: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#2A2E30',
  },
  titl: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#2A2E30',
  },
  txt: {
    color: '#2A2E30',
  },
});

export default Home;