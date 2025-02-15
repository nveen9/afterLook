import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Animated } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

const ContactList = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [noContacts, setNoContacts] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isEnabled) {
      const getEnab = async () => {
        try {
          const enab = await AsyncStorage.getItem("SMSenab");
          if (enab !== null) {
            const enabb = JSON.parse(enab);
            setIsEnabled(enabb);
          } else {
            console.log("No saved state");
          }
        } catch (error) {
          console.log("Error getting the state", error);
        }
      };
      getEnab();
    }
  }, [isEnabled]);

  useEffect(() => {
    if (isFocused) {
      console.log("isFocused")
      const getSavedContacts = async () => {
        try {
          const savedContactsJson = await AsyncStorage.getItem("selectedContacts");
          if (savedContactsJson !== null) {
            const savedContacts = JSON.parse(savedContactsJson);
            if (savedContacts && savedContacts.length > 0) {
              console.log("Selected contacts retrieved from local storage:", savedContacts);
              setSelectedContacts(savedContacts);
              setNoContacts(false);
            } else {
              setNoContacts(true);
              console.log("No selected contacts found in local storage");
            }
          } else {
            setNoContacts(true);
            console.log("No selected contacts found in local storage");
          }
        } catch (error) {
          console.log("Error retrieving selected contacts from local storage:", error);
        }
      };
      getSavedContacts();
    }
  }, [isFocused]);

  useEffect(() => {
    console.log("Current Contacts ", selectedContacts);
    onSaveUpdatedContacts(selectedContacts);
  }, [selectedContacts]);

  const toggleSwitch = async () => {
    if (isEnabled) {
      await AsyncStorage.setItem('SMSenab', JSON.stringify(!isEnabled));
      console.log('Disable');
    } else {
      try {
        await AsyncStorage.setItem('SMSenab', JSON.stringify(!isEnabled));
        console.log('Enable');
      } catch (error) {
        console.log('Error', error);
      }
    }
    setIsEnabled(previousState => !previousState);
  }

  const renderItem = ({ item, drag, isActive }) => {
    const renderRightActions = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setSelectedContacts((prevData) =>
              prevData.filter((contact) => contact.recordID !== item.recordID)
            );
          }}
        >
          <Animated.Text style={{ transform: [{ translateX: trans }] }}>
            Delete
          </Animated.Text>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={styles.itemContainer}
          >
            <Text style={styles.txt}>{item.displayName}</Text>
            {item.phoneNumbers && item.phoneNumbers.length > 0 && (
              <Text style={styles.txt}>{item.phoneNumbers}</Text>
            )}
          </TouchableOpacity>
        </ScaleDecorator>
      </Swipeable>
    );
  };

  const onSaveUpdatedContacts = async (selectedContacts) => {
    try {
      await AsyncStorage.setItem('selectedContacts', JSON.stringify(selectedContacts));
    } catch (error) {
      console.log('Error saving updated contacts to local storage:', error);
    }
  };

  return (
    <>
      {noContacts ?
        <View style={styles.nocontainer}>
          <View style={styles.nocont}>
            <Text style={styles.notxt}>No Contacts</Text>
          </View>
        </View>
        :
        <View style={styles.container}>
          <View style={styles.switchContainer}>
            <Text style={styles.enableTxt}>Enable to Send SMS Notifications</Text>
            <Switch
              style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], margin: 10 }}
              trackColor={{ false: '#767577', true: '#FFD700' }}
              thumbColor={isEnabled ? '#2A2E30' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <View style={styles.cont}>
            <Text style={styles.ordertxt}>Reorder the Contacts as Priority</Text>
            <View style={styles.nocont}>
              <Text style={styles.dordertxt}>Hold to drag</Text>
            </View>
          </View>
          <DraggableFlatList
            data={selectedContacts}
            onDragEnd={({ data }) => {
              setSelectedContacts(data);
              console.log("End Data: ", data);
            }}
            renderItem={renderItem}
            keyExtractor={(item) => item.recordID}
          />
        </View>}
    </>
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
    margin: 10,
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

export default ContactList;
