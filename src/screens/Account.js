import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, StatusBar } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useIsFocused } from '@react-navigation/native';

const Account = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [randomNum, setRandomNum] = useState(0);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            const unsubscribe = auth().onAuthStateChanged((user) => {
                setUser(user);
                console.log('focused');
                if (user !== null) {
                    const getFromFirestore = async () => {
                        const snapshot = await firestore()
                            .collection('Users')
                            .doc(user.uid)
                            .get();
                        if (snapshot.exists) {
                            setName(snapshot.data().name);
                            setRandomNum(snapshot.data().randomNum);
                        }
                    }
                    getFromFirestore();
                }
            });
            return () => {
                unsubscribe();
            };
        }
    }, [isFocused, user]);

    const randomCode = async () => {
        const rCode = Math.floor(100000 + Math.random() * 900000);
        console.log('randomCode', rCode);
    }

    const logout = async () => {
        const googleUser = await GoogleSignin.isSignedIn();

        if (googleUser) {
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                auth().signOut().then(() => {
                    setName('');
                    console.log('Signout Success');
                }).catch((error) => {
                    console.log(error);
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            auth().signOut().then(() => {
                setName('');
                console.log('Signout Success');
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.ncontainer}>
                <StatusBar translucent backgroundColor="#2A2E30" />
                <Text style={styles.wTxt}>Welcome</Text>
                {user ?
                    <>
                        <Text style={styles.eTxt}>{name}</Text>          
                        <View style={styles.codeView}>
                            <Text style={styles.txt}>CODE</Text>
                            <View style={styles.box}>
                                <Text style={styles.ctxt}>{randomNum}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.button} title='Logout' onPress={logout}>
                            <Text style={styles.signUpText}>Logout</Text>
                        </TouchableOpacity>
                    </>
                    :
                    <>
                        <Text style={styles.eTxt}>No User Signed In</Text>
                        <View style={styles.devider}></View>
                        <TouchableOpacity style={styles.button} title='Signup' onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.signUpText}>Login</Text>
                        </TouchableOpacity>
                    </>}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    ncontainer: {
        marginTop: '3%',
        marginBottom: '3%',
        alignItems: "center",
    },
    devider: {
        margin: '10%',
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
});

export default Account;