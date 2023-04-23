import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, StatusBar } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Account = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');

    useEffect(() => {
        const subscribe = auth().onAuthStateChanged((user) => {
            setUser(user);
        });
        return subscribe;
    }, []);

    useEffect(() => {
        if (user) {
            const getFromFirestore = async () => {
                const snapshot = await firestore()
                    .collection('Users')
                    .doc(user.uid)
                    .get();
                    if(snapshot.exists){
                        setName(snapshot.data().name);
                    }            
            }
            getFromFirestore();
        }
    }, [user]);

    const logout = async () => {
        const googleUser = await GoogleSignin.isSignedIn();

        if (googleUser) {
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                auth().signOut().then(() => {
                    console.log('Signout Success');
                }).catch((error) => {
                    console.log(error);
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            auth().signOut().then(() => {
                console.log('Signout Success');
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="#2A2E30" />
            <Text style={styles.wTxt}>Welcome</Text>
            <Text style={styles.eTxt}>{user ? name : 'No User Signed In'}</Text>
            <View style={styles.devider}></View>
            <TouchableOpacity style={styles.button} title='Signup' onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signUpText}>Login</Text>
            </TouchableOpacity>
            <View style={styles.devider}></View>
            <TouchableOpacity style={styles.button} title='Logout' onPress={logout}>
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
        backgroundColor: "#fff",
    },
    devider: {
        margin: 10,
    },
    wTxt: {
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
        width: 100,
        alignItems: 'center',
        backgroundColor: '#FFD700',
        padding: 10,
        borderRadius: 50,
    },
    signUpText: {
        fontWeight: 'bold',
        color: '#2A2E30',
    },
});

export default Account;