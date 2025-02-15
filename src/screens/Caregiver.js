import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, TextInput, View, StatusBar, Modal, Linking, PermissionsAndroid, Platform, TouchableOpacity } from "react-native";
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from "@react-native-community/geolocation";

const CareGiver = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [pairCode, setPairCode] = useState('');
  const [pairedDetails, setPairedDetails] = useState(null);
  const [isPaired, setIsPaired] = useState(false);

  const [location, setLocation] = useState({ latitude: null, longitude: null });

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
      await AsyncStorage.removeItem('paired');
      setIsPaired(false);
      Toast.show('unpaired Success', Toast.SHORT);
    } catch (error) {
      console.log('Error saving', error);
    }
  }

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getLocation();
        } else {
          console.log('Location permission denied');
        }
      } else if (Platform.OS === 'ios') {
        const status = Geolocation.requestAuthorization();
        if (status === 'granted') {
          console.log('Location permission granted');
          getLocation();
        } else {
          console.log('Location permission denied');
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  const getPharmaciesLocations = async (value) => {
    await requestLocationPermission();
    let urlPha = '';
    if (value === 1) {
      console.log('Getting Faller Nearest');
      const doc = await firestore().collection('Users').doc(pairedDetails.userid).get();
      const geopoint = doc.data().geoL;
      if (geopoint !== undefined) {
        urlPha = `geo:${geopoint.latitude},${geopoint.longitude}?q=pharmacy`;
      } else {
        Toast.show("Not any Falling Activity Detected", Toast.LONG);
      }
    }
    else if (value === 0) {
      console.log('Getting Your Nearest');
      urlPha = `geo:${location.latitude},${location.longitude}?q=pharmacy`;
    }
    Linking.openURL(urlPha).then(supported => {
      if (supported) {
        Linking.openURL(urlPha);
      } else {
        console.log("Can't Find, maybe Your don't gave Google Maps in your mobile or Did not enable");
      }
    });
  };

  const getHospitalsLocations = async (value) => {
    await requestLocationPermission();
    let urlPha = '';
    if (value === 1) {
      console.log('Getting Faller Nearest');
      const doc = await firestore().collection('Users').doc(pairedDetails.userid).get();
      const geopoint = doc.data().geoL;
      if (geopoint !== undefined) {
        urlPha = `geo:${geopoint.latitude},${geopoint.longitude}?q=hospitals`;
      } else {
        Toast.show("Not any Falling Activity Detected", Toast.LONG);
      }
    }
    else if (value === 0) {
      console.log('Getting Your Nearest');
      urlPha = `geo:${location.latitude},${location.longitude}?q=hospitals`;
    }
    Linking.openURL(urlPha).then(supported => {
      if (supported) {
        Linking.openURL(urlPha);
      } else {
        console.log("Can't Find, maybe Your don't gave Google Maps in your mobile or Did not enable");
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.ncontainer}>
        <StatusBar translucent backgroundColor="#2A2E30" />
        <Text style={styles.pTxt}>PAIRING</Text>
        {isPaired ?
          <>
            <Text style={styles.eTxt}>Paired with {pairedDetails.name}</Text>
            <View style={styles.devider}></View>
            <TouchableOpacity style={styles.button} title='unparing' onPress={unpair}>
              <Text style={styles.signUpText}>Unpair</Text>
            </TouchableOpacity>

            <View style={styles.findContainer}>
              <TouchableOpacity style={styles.button} title='Paring' onPress={() => getPharmaciesLocations(1)}>
                <Text style={styles.signUpText}>Find Nearest Pharmacies</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} title='Paring' onPress={() => getHospitalsLocations(1)}>
                <Text style={styles.signUpText}>Find Nearest Hospitals</Text>
              </TouchableOpacity>
            </View>
          </>
          :
          <>
            <Text style={styles.eTxt}>No User Paired</Text>
            <View style={styles.devider}></View>
            <TouchableOpacity style={styles.button} title='Paring' onPress={() => setModalVisible(true)}>
              <Text style={styles.signUpText}>Paring with Faller</Text>
            </TouchableOpacity>

            <View style={styles.findContainer}>
              <TouchableOpacity style={styles.button} title='Paring' onPress={() => getPharmaciesLocations(0)}>
                <Text style={styles.signUpText}>Find Nearest Pharmacies</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} title='Paring' onPress={() => getHospitalsLocations(0)}>
                <Text style={styles.signUpText}>Find Nearest Hospitals</Text>
              </TouchableOpacity>
            </View>
          </>
        }
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
  findContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 30
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