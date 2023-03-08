import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const ContactList = ({ navigation }) => {

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [noContacts, setNoContacts] = useState(false);
  const isFocused = useIsFocused();

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

  const renderItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={styles.itemContainer}
      >
        <Text style={styles.txt}>{item.displayName}</Text>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <Text style={styles.txt}>{item.phoneNumbers[0].number}</Text>
        )}
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <>
      {noContacts ?
        <View style={styles.nocontainer}>
          <Button
            title="Select Contacts"
            onPress={() => navigation.navigate("AddContacts")}
          />
          <View style={styles.nocont}>
            <Text style={styles.notxt}>No Contacts</Text>
          </View>
        </View>
        :
        <View style={styles.container}>
          <Button
            title="Select Contacts"
            onPress={() => navigation.navigate("AddContacts")}
          />
          <View style={styles.cont}>
            <Text style={styles.notxt}>Order the Contacts as Priority</Text>
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
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  nocontainer: {
    flex: 1,
    backgroundColor: "#FFF",
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
  txt: {
    color: "#000",
  },
  nocont: {
    alignItems: "center",
    justifyContent: "center",
  },
  notxt: {
    color: "#000",
  }
});

export default ContactList;
