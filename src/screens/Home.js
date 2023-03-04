import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useIsFocused } from '@react-navigation/native';

const Home = ({ navigation }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isFocused = useIsFocused();

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

  const logout = async () => {
    const googleUser = await GoogleSignin.isSignedIn();

    if(googleUser) {
      try{
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }catch(err){
        console.log(err);
      }     
    }else {
      auth().signOut().then(() => {
        console.log('Signout Success');
      }).catch((error) => {
        console.log(error);
      });
    } 
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.signUpText}>Email {isSignedIn ? auth().currentUser.email : 'No User Signed In'}</Text>
      <View style={styles.devider}></View>
      <TouchableOpacity title='Signup' onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signUpText}>Signup</Text>
      </TouchableOpacity>
      <View style={styles.devider}></View>
      <TouchableOpacity title='Logout' onPress={logout}>
        <Text style={styles.signUpText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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