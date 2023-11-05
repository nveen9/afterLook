import React, { useState, useEffect, useCallback  } from 'react'
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

const MapScreen = () => {

    const [currentLocation, setCurrentLocation] = useState({
        latitude: 0,
        longitude: 0,
    });
    const [currentDeltas, setCurrentDeltas] = useState({
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [pairedDetails, setPairedDetails] = useState(null);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (pairedDetails !== null) {
            console.log(pairedDetails);
            getCurrentLocation();
            const interval = setInterval(() => {
                getCurrentLocation();
            }, 5000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [pairedDetails]);

    const pairedData = useCallback(async () => {
        try {
            const pairD = await AsyncStorage.getItem("paired");
            if (pairD !== null) {
                const us = JSON.parse(pairD);
                if (us !== null) {
                    setPairedDetails(us);
                    const doc = await firestore().collection('Users').doc(us.userid).get();
                    if (doc.data().falled === true) {
                        await firestore()
                            .collection('Users')
                            .doc(us.userid)
                            .update({
                                notify: false,
                            })
                            .then(() => {
                                console.log('Notify Updated');
                            });
                    }
                } else {
                    console.log("No pairing");
                }
            } else {
                console.log("No pairing");
            }
        } catch (error) {
            console.log("Error retrieving ", error);
        }
    },[]);

    useEffect(() => {
        if (isFocused) {
            pairedData();
        }
    }, [isFocused, pairedData]);

    const getCurrentLocation = async () => {
        const doc = await firestore().collection('Users').doc(pairedDetails.userid).get();
        if (doc.data().falled === true) {
            const geopoint = doc.data().geoL;
            setCurrentLocation({
                latitude: geopoint.latitude,
                longitude: geopoint.longitude,
            })
            console.log(geopoint.latitude, geopoint.longitude);
        }
    };

    const onRegionChange = debounce(region => {
        setCurrentDeltas({
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        });
    }, 300); // Adjust the debounce delay

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    ...currentDeltas,
                }}
                onRegionChange={onRegionChange}
            >
                <Marker
                    coordinate={currentLocation}
                    title="Current Location"
                    description="Person is here"
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapScreen;