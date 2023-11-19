import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, TouchableOpacity, StatusBar, Switch, Linking, PermissionsAndroid, Platform } from "react-native";
import Toast from 'react-native-simple-toast';
import { FLASK_API } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import BackgroundService from 'react-native-background-actions';
import PushNotification from 'react-native-push-notification';
import RNExitApp from 'react-native-exit-app';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';

setUpdateIntervalForType(SensorTypes.accelerometer, 10);
setUpdateIntervalForType(SensorTypes.gyroscope, 10);

const Home = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [count, setCount] = useState(null);
  const [isFalled, setIsFalled] = useState(false);

  useEffect(() => {
    const falled = async () => {
      try {
        const enab = await AsyncStorage.getItem("isFalled");
        if (JSON.parse(enab) === true) {
          setIsFalled(true);
        } else {
          console.log("No saved state");
        }
      } catch (error) {
        console.log("Error getting the state", error);
      }
    };
    falled();
  }, []);

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

  PushNotification.createChannel(
    {
      channelId: 'afterlookChannel', // Choose a unique channel ID
      channelName: 'Your Channel Name',
      channelDescription: 'Your Channel Description',
      soundName: 'default',
      importance: 4, // 4 = HIGH, 3 = DEFAULT, 2 = LOW, 1 = MIN, 0 = NONE
    },
    (created) => console.log(`Channel created: ${created}`),
  );

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

      const collectData = async (sensor, duration) => {
        let data = [];
        let startTime = Date.now();
        let endTime = startTime + duration;

        const subscription = sensor.subscribe((sensorData) => {
          data.push(sensorData);
          const currentTime = Date.now();
          if (currentTime >= endTime) {
            subscription.unsubscribe();
          }
        });

        await new Promise((resolve) => setTimeout(resolve, duration));

        return data;
      };

      while (true) {
        const [accData, gyroData] = await Promise.all([
          collectData(accelerometer, 6000), // 6 seconds
          collectData(gyroscope, 6000), // 6 seconds
        ]);

        // Convert the timestamps to seconds
        const accDataInSeconds = accData.map(item => {
          return {
            ...item,
            timestamp: (item.timestamp - accData[0].timestamp) / 1000, // Convert to seconds
          };
        });
        // Additional pre-processing step
        const accMagnitudeThreshold = 15.0;

        // Extract data between 3-4 seconds cus this the best time period
        const startTime = 3.0;
        const endTime = 4.0;
        const accDataIn4th = accDataInSeconds.filter(
          (data) =>
            data.timestamp >= startTime &&
            data.timestamp < endTime
        );
        // Find the highest acceleration magnitude value
        let accMagnitude4th = -Infinity;

        accDataIn4th.forEach(data => {
          const accelerationMagnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
          accMagnitude4th = Math.max(accMagnitude4th, accelerationMagnitude);
        });
        console.log('Highest Acceleration magnitude: ', accMagnitude4th)
        if (accMagnitude4th > accMagnitudeThreshold) {
          const requestBody = {
            data: accData,
            gyData: gyroData,
          };
          console.log('Sending...')
          await axios.post(`${FLASK_API}/predict`, requestBody)
            .then(async response => {
              console.log('Sent and getting...')
              console.log('Response data:', response.data);
              if (response.data.isFalled === true) {
                setIsFalled(true);
                await AsyncStorage.setItem('isFalled', JSON.stringify(true));

                // Show notification with action buttons
                PushNotification.localNotification({
                  channelId: 'afterlookChannel', // Use the same channel ID
                  title: 'Alert!!! Fall Detected!!!',
                  message: 'Did you fall?',
                });

                // Countdown timer in the notification
                let countdown = 15;
                const countdownInterval = setInterval(async () => {
                  setCount(countdown);
                  countdown--;

                  if (countdown < 0) {
                    yes();
                    clearInterval(countdownInterval);
                    setCount(null);
                  }
                }, 1000);

                PushNotification.configure({
                  onNotification: function () {
                    console.log('Clicked');
                  }
                });
              }
            })
            .catch(err => {
              console.error('Error:', err);
            });

        } else {
          console.log('Threshold is lower');
        }

        await BackgroundService.updateNotification({ taskDesc: 'Reading' }); // Only Android, iOS will ignore this call      
        await sleep(delay);
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

  Linking.addEventListener('url', handleOpenURL);

  function handleOpenURL(event) {
    // Will be called when the notification is pressed
    const { url } = event;
    console.log(url)
  }
  //

  const yes = async () => {
    setIsFalled(false);
    await AsyncStorage.setItem('isFalled', JSON.stringify(false));
    console.log('Calling the function...');
  };

  const no = async () => {
    setIsFalled(false);
    await AsyncStorage.setItem('isFalled', JSON.stringify(false));
    console.log('nooo');
  };

  const toggleSwitch = async () => {
    if (isEnabled) {
      Toast.show('App is Stopped', Toast.LONG);
      await BackgroundService.stop();
      await AsyncStorage.setItem('enab', JSON.stringify(!isEnabled));
      RNExitApp.exitApp();
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
      {isFalled ?
        <>
          <Text style={styles.timer}>Did You Fall?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={yes}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={no}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </>
        :
        <>
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
        </>
      }
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
  timer: {
    fontSize: 50,
    color: "#000",
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 20
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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