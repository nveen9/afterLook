import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, TextInput, View, StatusBar, Modal, TouchableOpacity, Linking, PermissionsAndroid } from "react-native";
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import BackgroundService from 'react-native-background-actions';
import Sound from 'react-native-sound';
import alertSound from '../sounds/warning.mp3';

const CareGiver = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [pairCode, setPairCode] = useState('');
  const [pairedDetails, setPairedDetails] = useState(null);
  const [isPaired, setIsPaired] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const pairedData = async () => {
        try {
          const pairD = await AsyncStorage.getItem("paired");
          if (pairD !== null) {
            const us = JSON.parse(pairD);
            if (us !== null) {
              setPairedDetails(us);
              console.log(pairedDetails);
              setIsPaired(true);
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
    }
  }, [isFocused]);

  //Background task
  const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

  // BackgroundService.on('expiration', () => {
  //   console.log('I am being closed :(');
  // });

  Sound.setCategory('Playback');

  var whoosh = new Sound(alertSound, error => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
  });

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
          for (let i = 0; BackgroundService.isRunning(); i++) {
            const pairD = await AsyncStorage.getItem("paired");
            const us = JSON.parse(pairD);
            setPairedDetails(us);
            setIsPaired(true);
            const snapshot = await firestore()
              .collection('Users')
              .doc(us.userid)
              .get();
            if (snapshot.exists) {
              if (snapshot.data().notify === true) {
                whoosh.play();
                whoosh.setVolume(1);
                await BackgroundService.updateNotification({ taskDesc: 'Alert!' }); // Only Android, iOS will ignore this call      
                await sleep(delay);
              } else {
                whoosh.stop();
                await BackgroundService.updateNotification({ taskDesc: 'No Notifications' }); // Only Android, iOS will ignore this call  
                await sleep(delay);
              }
            } else {
              await BackgroundService.updateNotification({ taskDesc: 'No Notifications' }); // Only Android, iOS will ignore this call      
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
    taskTitle: 'Notification',
    taskDesc: 'No Notifications',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#fff',
    linkingURI: 'backScheme://chat/jane', // See Deep Linking for more info
    parameters: {
      delay: 1000,
    },
  };
  // 

  const getl = async () => {
    const doc = await firestore().collection('Users').doc(pairedDetails.userid).get();
    if (doc.data().falled === true) {
      whoosh.stop();
      const geopoint = doc.data().geoL;

      //assign lat and long from geo points
      const latitude = geopoint.latitude;
      const longitude = geopoint.longitude;
      const urlPha = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(urlPha).then(supported => {
        if (supported) {
          Linking.openURL(urlPha);
        } else {
          console.log("warning");
        }
      });
    } else {
      Toast.show('No Emergency Situation Found', Toast.SHORT);
    }
  }

  const paringCode = async () => {
    await firestore()
      .collection('Users')
      // Filter results
      .where('email', '==', email)
      .where('randomNum', '==', parseInt(pairCode))
      .get()
      .then(async querySnapshot => {
        if (querySnapshot.empty) {
          Toast.show("Provide Faller's Email and Code", Toast.SHORT);
          console.log('No match found');
        } else {
          querySnapshot.forEach(async (doc) => {
            const data = { name: doc.data().name, userid: doc.data().userId };
            setPairedDetails(data);
            try {
              await AsyncStorage.setItem('paired', JSON.stringify(data));
            } catch (error) {
              console.log('Error saving', error);
            }
          });
          setModalVisible(!modalVisible);
          setIsPaired(true);
          await BackgroundService.start(veryIntensiveTask, options);
          Toast.show('Paired Success', Toast.SHORT);
        }
      }).catch((error) => {
        console.log(error);
      });
  }

  const unpair = async () => {
    try {
      await AsyncStorage.setItem('paired', JSON.stringify(null));
      setIsPaired(false);
      Toast.show('unpaired Success', Toast.SHORT);
    } catch (error) {
      console.log('Error saving', error);
    }
  }

  const start = async () => {
    await BackgroundService.start(veryIntensiveTask, options);
  }

  const stop = async () => {
    await BackgroundService.stop();
    whoosh.stop();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.ncontainer}>
        <StatusBar translucent backgroundColor="#2A2E30" />
        <View style={styles.pairContainer}>
          <Text style={styles.pTxt}>PAIRING</Text>
          {isPaired ?
            <>
              <Text style={styles.eTxt}>Paired with {pairedDetails.name}</Text>
              <View style={styles.devider}></View>
              <TouchableOpacity style={styles.button} title='unparing' onPress={unpair}>
                <Text style={styles.signUpText}>Unpair</Text>
              </TouchableOpacity>
              <View style={styles.devider}></View>
              <TouchableOpacity style={styles.button} title='getL' onPress={getl}>
                <Text style={styles.signUpText}>Get Location</Text>
              </TouchableOpacity>
            </>
            :
            <>
              <Text style={styles.eTxt}>No User Paired</Text>
              <View style={styles.devider}></View>
              <TouchableOpacity style={styles.button} title='Paring' onPress={() => setModalVisible(true)}>
                <Text style={styles.signUpText}>Paring with Faller</Text>
              </TouchableOpacity>
            </>
          }
          <View style={styles.devider}></View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity title='start' onPress={start}>
              <Text style={styles.signUpText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity title='stop' onPress={stop}>
              <Text style={styles.signUpText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => { setModalVisible(!modalVisible) }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Paring</Text>
              <View style={styles.textInputContainer}>
                <TextInput style={styles.textInput} placeholder="Enter Faller's Email Address" value={email} onChangeText={text => setEmail(text)} placeholderTextColor='gray' keyboardType="email-address" />
              </View>
              <View style={styles.textInputContainer}>
                <TextInput style={styles.textInput} placeholder='Enter Paring Code' value={pairCode} onChangeText={text => setPairCode(text)} placeholderTextColor='gray' keyboardType="numeric" />
              </View>
              <View style={styles.pressView}>
                <TouchableOpacity style={styles.mbutton} onPress={paringCode}>
                  <Text style={styles.mbuttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mbutton} onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.mbuttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  ncontainer: {
    marginTop: '3%',
    marginBottom: '3%',
    alignItems: "center",
  },
  accContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  pairContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  cDivider: {
    margin: '3%',
  },
  devider: {
    margin: '10%',
  },
  wTxt: {
    fontWeight: 'bold',
    fontSize: 40,
    color: '#B68D40',
  },
  pTxt: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#B68D40',
  },
  eTxt: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#B68D40',
  },
  button: {
    width: 150,
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 50,
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#2A2E30',
    textAlign: 'center',
  },
  codeView: {
    flex: 1,
    justifyContent: 'center',
  },
  box: {
    borderWidth: 2,
    borderTopWidth: 0,
    borderRadius: 10,
    borderColor: '#B68D40',
    backgroundColor: 'transparent',
    padding: 10,
  },
  txt: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#B68D40',
  },
  ctxt: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#B68D40',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  textInput: {
    height: 40,
    width: '80%',
    margin: 10,
    padding: 10,
    color: '#565b64'
  },
  pressView: {
    flexDirection: 'row',
    gap: 10,
  },
  mbutton: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 5,
    borderRadius: 50,
  },
  mbuttonText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2A2E30',
    textAlign: 'center',
  },
  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#2A2E30',
    textAlign: 'center',
  },
});

export default CareGiver;