import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import { useIsFocused } from '@react-navigation/native';

const Features = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            const getEnab = async () => {
                try {
                    const enab = await AsyncStorage.getItem("liveLoc");
                    if (enab !== null) {
                        const uID = await AsyncStorage.getItem("userID");
                        if (uID !== null) {
                            const enabb = JSON.parse(enab);
                            setIsEnabled(enabb);
                        }
                    } else {
                        console.log("No saved state");
                        setIsEnabled(false);
                    }
                } catch (error) {
                    console.log("Error getting the state", error);
                }
            };
            getEnab();
        }
    }, [isFocused]);

    const toggleSwitch = async () => {
        if (isEnabled) {
            await AsyncStorage.setItem('liveLoc', JSON.stringify(!isEnabled));
            console.log('Disable');
        } else {
            try {
                const uID = await AsyncStorage.getItem("userID");
                if (uID !== null) {
                    await AsyncStorage.setItem('liveLoc', JSON.stringify(!isEnabled));
                    Toast.show('Live Location Sharing Enabled', Toast.LONG);
                    console.log('Enable');
                } else {
                    Toast.show('Need to Register for Live Location Sharing', Toast.LONG);
                    console.log('Need to Register for Live Sharing');
                    setIsEnabled(true);
                }
            } catch (error) {
                console.log('Error', error);
                setIsEnabled(true);
            }
        }
        setIsEnabled(previousState => !previousState);
    }

    return (
        <View style={styles.container}>
            <View style={styles.cont}>
                <Text style={styles.ordertxt}>Enable Feature Modes as You Prefer</Text>
                <View style={styles.nocont}>
                    <Text style={styles.dordertxt}>Disable Features when not in use!</Text>
                </View>
            </View>
            <View style={styles.switchContainer}>
                <Text style={styles.enableTxt}>Enable Live Location</Text>
                <Switch
                    style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], margin: 10 }}
                    trackColor={{ false: '#767577', true: '#FFD700' }}
                    thumbColor={isEnabled ? '#2A2E30' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
        alignItems: "center",
    },
    nocontainer: {
        flex: 1,
        backgroundColor: '#FDFDFD',
        alignItems: "center",
        justifyContent: "center",
    },
    itemContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#fff",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
    },
    txt: {
        color: "#000",
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
        right: 0,
    },
    cont: {
        alignItems: "center",
        margin: 10
    },
    nocont: {
        alignItems: "center",
        justifyContent: "center",
    },
    notxt: {
        color: "#B68D40",
        fontWeight: "bold",
    },
    enableTxt: {
        color: "#000",
        fontWeight: "bold",
    },
    ordertxt: {
        color: "#B68D40",
        fontWeight: "bold",
        fontStyle: "italic",
    },
    dordertxt: {
        color: "#B68D40",
        fontStyle: "italic",
    },
});

export default Features;
