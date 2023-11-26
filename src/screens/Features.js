import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, Modal, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import { useIsFocused } from '@react-navigation/native';

const Features = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        modalText: ''
      });
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
                            setModalData({
                                title: 'Live Location Sharing Mode',
                                modalText: 'In case of an Emergency, User can enable this Mode. \n\nFaller won\'t get notification alert with Siren Sound. \n\nLocation will be shared to Caregiver when Mobile Phone is Shaked, Put into the Pocket, Running, Speed Walking and Activities related to other than Relaxing.'
                              });
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
                    setModalVisible(!modalVisible);
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
                <Text style={styles.enableTxt}>Live Location Sharing</Text>
                <Switch
                    style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], margin: 10 }}
                    trackColor={{ false: '#767577', true: '#FFD700' }}
                    thumbColor={isEnabled ? '#2A2E30' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setModalVisible(!modalVisible) }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalData.title}</Text>
                        <View style={styles.modaltextContainer}>
                            <Text style={styles.modalText}>{modalData.modalText}</Text>
                        </View>
                        <View style={styles.pressView}>
                            <TouchableOpacity style={styles.mbutton} onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={styles.mbuttonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFD',
        alignItems: "center",
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
    },
    cont: {
        alignItems: "center",
        margin: 10
    },
    nocont: {
        alignItems: "center",
        justifyContent: "center",
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
        padding: 20,
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
    modaltextContainer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#2A2E30',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 10,
        color: '#2A2E30',
        textAlign: 'center',
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
});

export default Features;
