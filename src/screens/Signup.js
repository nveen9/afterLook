import { ScrollView, View, Text, TextInput, Alert, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { CLIENT_ID } from '@env'
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

GoogleSignin.configure({
  webClientId: CLIENT_ID,
});

const Signup = ({ navigation }) => {
  const [fname, setFname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const registerInUser = () => {
    if (email == '') {
      Alert.alert(
        'Empty Field',
        'Please Enter Email Address',
      );
    }
    else if (password == '') {
      Alert.alert(
        'Empty Field',
        'Please Enter Password',
      );
    }
    else if (fname == '') {
      Alert.alert(
        'Empty Field',
        'Please Enter Name',
      );
    }
    else {
      auth().createUserWithEmailAndPassword(email, password)
        .then((e) => {
          const user = auth().currentUser;
          firestore().collection('Users').doc(user.uid)
            .set({
              name: fname,
              email: email,
              userId: user.uid,
            })
            .then(() => {
              console.log('User added!');
              navigation.navigate('TabNav');
              Alert.alert(
                'Success',
                'Registered Successfully',
              );
            });

        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');
            Alert.alert(
              'Incorrect',
              'That email address is already in use!',
            );
          }

          if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
            Alert.alert(
              'Incorrect',
              'That email address is invalid!',
            );
          }
          console.error(error);
        })
    }
  }

  async function storeData(user) {
    try {
      const userRef = firestore().collection('Users').doc(user.uid);
      const userSnapshot = await userRef.get();

      if (!userSnapshot.exists) {
        await userRef.set({
          name: user.displayName,
          email: user.email,
          userId: user.uid,
        });
        console.log('User added!');
        navigation.navigate('TabNav');
        Alert.alert(
          'Success',
          'Registered Successfully',
        );
      } else {
        console.log('Already Registered!');
        navigation.navigate('TabNav');
        Alert.alert(
          'Already Registered',
          'You already have an account for this Gmail \n\Logged in Successfully',
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const { user } = await auth().signInWithCredential(googleCredential);

      await storeData(user);
    } catch (error) {
      if (error.message === 'Sign in action cancelled') {
        console.log('Cancelled');
      } else {
        console.log(error);
      }
    }
  }

  return (
    <ScrollView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.inner}>
            <View style={styles.textInputContainer}>
              <Feather style={{ marginRight: 10 }} name='user' size={25} color='#D6AD60' />
              <TextInput style={styles.textInput} placeholder='Full Name' value={fname} onChangeText={text => setFname(text)} />
            </View>
            <View style={styles.textInputContainer}>
              <Fontisto style={{ marginRight: 10 }} name='email' size={25} color='#D6AD60' />
              <TextInput style={styles.textInput} placeholder='Email' value={email} onChangeText={text => setEmail(text)} />
            </View>
            <View style={styles.textInputContainer}>
              <Feather style={{ marginRight: 10 }} name='lock' size={25} color='#D6AD60' />
              <TextInput style={styles.textInput} placeholder='Password' value={password} secureTextEntry={secureTextEntry} onChangeText={text => setPassword(text)} />
              <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                <MaterialIcons
                  name={
                    secureTextEntry
                      ? 'visibility-off'
                      : 'visibility'
                  }
                  size={25}
                  color='#D6AD60'
                />
              </TouchableOpacity>
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.button} title='Register' onPress={registerInUser}>
                <Text style={styles.loginText}>Register</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.button} title='Google Sign-In' onPress={onGoogleButtonPress}>
                <Text style={styles.loginText}>Google Sign-In</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.btnContainer}>
              <View style={styles.signUpContainer}>
                <Text style={{ marginRight: 10 }}>
                  Already have an account?
                </Text>
                <TouchableOpacity title='Login' onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signUpText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2E2E',
  },
  inner: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  img: {
    resizeMode: 'contain',
    width: 320,
    height: 300,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 50,
  },
  loginText: {
    fontSize: 15,
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 0.5,
    marginBottom: 20,
  },
  textInput: {
    height: 40,
    width: '80%',
    paddingBottom: 10,
  },
  btnContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#D1B000',
  },
});

export default Signup