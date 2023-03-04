import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';

const Home = ({ navigation }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      auth().onAuthStateChanged(user => {
        if (!user) {
            console.log('User not found!');
            setIsSignedIn(true);
        } else {
          console.log('User found!');
          navigation.navigate('Home');
        }
      })
    }
  }, [isFocused]);

  const logout = () => {
    signOut(auth).then(() => {
      console.log('Signout Success');
      AsyncStorage.removeItem('userId');
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity title='Signup' onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signUpText}>Signup</Text>
      </TouchableOpacity>
      <View style={styles.devider}></View>
      <TouchableOpacity title='ID' onPress={() => console.log(auth.currentUser.uid)}>
        <Text style={styles.signUpText}>ID</Text>
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