import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../dbConfig/firebase';

const Home = ({ navigation }) => {
    const [isSignedIn, setIsSignedIn] = useState(false);

    onAuthStateChanged(auth, user => {
        if (!user) {
          if (!isSignedIn) {
            console.log('User not found!');
            setIsSignedIn(true);
          }
        } else {
          navigation.navigate('Home');
        }
      })

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity title='Signup' onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signUpText}>Signup</Text>
            </TouchableOpacity>
            <View style={styles.devider}></View>
            <TouchableOpacity title='ID' onPress={() => console.log(auth.currentUser.uid)}>
                <Text style={styles.signUpText}>ID</Text>
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