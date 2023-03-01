import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, FlatList } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const ContactList = ({ navigation }) => {

  const [selectedContacts, setSelectedContacts] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
    console.log("isFocused")
    const getSavedContacts = async () => {
      try {
        const savedContactsJson = await AsyncStorage.getItem("selectedContacts");
        if (savedContactsJson !== null) {
          const savedContacts = JSON.parse(savedContactsJson);
          console.log("Selected contacts retrieved from local storage:", savedContacts);
          setSelectedContacts(savedContacts);
        } else {
          console.log("No selected contacts found in local storage");
        }
      } catch (error) {
        console.log("Error retrieving selected contacts from local storage:", error);
      }
    };
    getSavedContacts();
  }
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.txt}>{item.displayName}</Text>
      {item.phoneNumbers && item.phoneNumbers.length > 0 && (
        <Text style={styles.txt}>{item.phoneNumbers[0].number}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="Select Contacts"
        onPress={() => navigation.navigate("AddContacts")}
      />
      <Button
        title="Select"
        onPress={() => navigation.navigate("Testt")}
      />
      <FlatList
        data={selectedContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.recordID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
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
  }
});

export default ContactList;
