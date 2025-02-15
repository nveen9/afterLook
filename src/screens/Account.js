import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, StatusBar, TouchableOpacity } from "react-native";
// import { TouchableOpacity } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';

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
                            await AsyncStorage.setItem('userID', user.uid);
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

    const logout = async () => {
        const googleUser = await GoogleSignin.isSignedIn();

        if (googleUser) {
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                auth().signOut().then(async () => {
                    setName('');

                    const removeItems = ['userID', 'liveLoc'];
                    await Promise.all(
                        removeItems.map(async (key) => {
                            await AsyncStorage.removeItem(key);
                        })
                    );
                    Toast.show('Logged out', Toast.SHORT);
                    console.log('Signout Success');
                }).catch((error) => {
                    console.log(error);
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            auth().signOut().then(async () => {
                setName('');

                const removeItems = ['userID', 'liveLoc'];
                await Promise.all(
                    removeItems.map(async (key) => {
                        await AsyncStorage.removeItem(key);
                    })
                );
                Toast.show('Logged out', Toast.SHORT);
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
                        <Text style={styles.eTxt}>No User Singed In</Text>
                        <View style={styles.devider}></View>
                        <TouchableOpacity style={styles.button} title='login' onPress={() => navigation.navigate('Login')}>
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
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    ncontainer: {
        marginTop: '3%',
        marginBottom: '3%',
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

export default Account;