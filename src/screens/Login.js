import { ScrollView, View, Text, Image, TextInput, Alert, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react'
import { CLIENT_ID } from '@env'
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

GoogleSignin.configure({
  webClientId: `${CLIENT_ID}`,
});

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const signInUser = () => {
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
    else {
      auth().signInWithEmailAndPassword(email, password)
        .then((re) => {
          console.log(re);
          navigation.navigate('TabNav');
          Alert.alert(
            'Success',
            'Logged in Successfully',
          );
        })
        .catch((err) => {
          console.log(err);
          Alert.alert(
            'Incorrect',
            'Crediantials are Incorrect',
          );
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
          'Logged in Successfully',
        );
      } else {
        console.log('Success');
        navigation.navigate('TabNav');
        Alert.alert(
          'Success',
          'Logged in Successfully',
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
            {/* <View>
              <Image source={require('../resou/logo.png')} style={styles.img} />
            </View> */}
            <View style={styles.textInputContainer}>
              <Feather style={{ marginRight: 10 }} name='user' size={25} color='#D6AD60' />
              <TextInput style={styles.textInput} placeholder='Email' value={email} onChangeText={text => setEmail(text)} placeholderTextColor='gray'/>
            </View>
            <View style={styles.textInputContainer}>
              <Feather style={{ marginRight: 10 }} name='lock' size={25} color='#D6AD60' />
              <TextInput style={styles.textInput} placeholder='Password' value={password} secureTextEntry={secureTextEntry} onChangeText={text => setPassword(text)} placeholderTextColor='gray'/>
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
              <TouchableOpacity style={styles.button} title='Login' onPress={signInUser}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.button} title='Google Sign-In' onPress={onGoogleButtonPress}>
                <Text style={styles.loginText}>Google Sign-In</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.btnContainer}>
              <View style={styles.signUpContainer}>
                <Text style={styles.txt}>
                  Don't have an account?
                </Text>
                <TouchableOpacity title='Signup' onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signUpText}>Signup</Text>
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
    backgroundColor: '#fff',
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
    color: '#2A2E30',
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
    color:'#565b64'
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
  txt: {
    marginRight: 10, 
    fontStyle: 'italic',
    color: '#2A2E30'
  }
});

export default Login