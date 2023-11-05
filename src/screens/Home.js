import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, StatusBar, Switch, Linking, PermissionsAndroid, Platform } from "react-native";
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import BackgroundService from 'react-native-background-actions';
import RNExitApp from 'react-native-exit-app';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';

setUpdateIntervalForType(SensorTypes.accelerometer, 5);
setUpdateIntervalForType(SensorTypes.gyroscope, 5);

const Home = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [subscriptionA, setSubscriptionA] = useState(null);
  const [subscriptionG, setSubscriptionG] = useState(null);
  const [accData, setAccData] = useState([]);
  const [gyroData, setGyroData] = useState([]);

  useEffect(() => {
    if (!isEnabled) {
      const getEnab = async () => {
        try {
          const enab = await AsyncStorage.getItem("enab");
          if (enab !== null) {
            const enabb = JSON.parse(enab);
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

  useEffect(() => {
    const pairedData = async () => {
      try {
        const pairD = await AsyncStorage.getItem("paired");
        if (pairD !== null) {
          const us = JSON.parse(pairD);
          if (us !== null) {
            const doc = await firestore().collection('Users').doc(us.userid).get();
            if (doc.data().falled === true) {
              await firestore()
                .collection('Users')
                .doc(us.userid)
                .update({
                  notify: false,
                })
                .then(() => {
                  navigation.navigate('Map');
                });
            }
          } else {
            console.log("No pairing");
          }
        } else {
          console.log("No pairing");
        }
      } catch (error) {
        console.log("Error retrieving ", error);
      }
    };
    pairedData();
  }, []);

  useEffect(() => {
    // if (accData.length == 800) {
    //   const predict = async () => {
    //     const requestBody = {
    //       data: accData,
    //       gyData: gyroData
    //     };

    //     console.log('data:', requestBody);
    //     await axios.post('http://localhost:5000/predict', requestBody)
    //       .then(response => {
    //         setAccData([]);
    //         setGyroData([]);
    //         console.log('Response data:', response.data);
    //       })
    //       .catch(err => {
    //         console.error('Error:', err);
    //       });
    //   };
    //   predict();
    // }
  }, [accData]);

  //Background task
  const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

  // BackgroundService.on('expiration', () => {
  //   console.log('I am being closed :(');
  // });

  // You can do anything in your task such as network requests, timers and so on,
  // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
  // React Native will go into "paused" mode (unless there are other tasks running,
  // or there is a foreground app).
  const veryIntensiveTask = async (taskDataArguments) => {
    try {
      const { delay } = taskDataArguments;
      await new Promise(async (resolve) => {
        let prevData = [];
        const subA = accelerometer.subscribe((data) => {
          // setAccData((prevData) => [...prevData, data]);

            prevData = [...prevData, data];
            const firstTimestamp = Math.round(prevData[0].timestamp / 1000);
            const targetTime = firstTimestamp + 5;
            const currTime = Math.round(prevData[prevData.length - 1].timestamp / 1000);
            let isCompleted = false;
            // Check if the target time exists in the final index
            if (currTime === targetTime) {
              if (!isCompleted) {
                console.log(prevData);
                isCompleted = true;
              }
              prevData = [];
            }
            return prevData;
     
        });
        setSubscriptionA(subA);
        const subG = gyroscope.subscribe((data) => {
          setGyroData((prevData) => [...prevData, data]);
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

  function handleOpenURL(event) {
    // Will be called when the notification is pressed
    const { url } = event;
    if (url.endsWith('/chat/jane')) {
      console.log(event.url)
    }
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
    marginBottom: '3%',
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