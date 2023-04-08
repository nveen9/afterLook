import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, TouchableOpacity, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Contacts from 'react-native-contacts';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddContacts = ({ navigation }) => {
  const [newContacts, setNewContacts] = useState([]);
  const sortedData = newContacts.sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts.',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Contacts permission granted');
        Contacts.getAll()
          .then((contacts) => {
            const newContacts = contacts.map(({ recordID, displayName, phoneNumbers }) => ({
              recordID,
              displayName: displayName || '',
              phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers[0].number : ''
            }));
            setNewContacts(newContacts);
            console.log(newContacts);
          })
          .catch((e) => {
            console.log(e);
          })
      } else {
        console.log('Contacts permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    requestContactsPermission();
  }, []);

  useEffect(() => {
    const getSavedContacts = async () => {
      try {
        const savedContactsJson = await AsyncStorage.getItem('selectedContacts');
        if (savedContactsJson !== null) {
          const savedContacts = JSON.parse(savedContactsJson);
          console.log('Selected contacts retrieved from local storage:', savedContacts);
          setSelectedContacts(savedContacts);
        } else {
          console.log('No selected contacts found in local storage');
        }
      } catch (error) {
        console.log('Error retrieving selected contacts from local storage:', error);
      }
    };

    getSavedContacts();
  }, []);

  const filteredContacts = sortedData.filter((contact) =>
    contact.displayName && contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.txt}>{item.displayName}</Text>
      {item.phoneNumbers && item.phoneNumbers.length > 0 && (
        <Text style={styles.txt}>{item.phoneNumbers}</Text>
      )}
      <TouchableOpacity
        title=""
        onPress={() => {
          if (selectedContacts.some((c) => c.recordID === item.recordID)) {
            setSelectedContacts(selectedContacts.filter((c) => c.recordID !== item.recordID));
          } else {
            setSelectedContacts([...selectedContacts, item]);
          }
        }}
      >
        <Icon name={selectedContacts.some((c) => c.recordID === item.recordID) ? 'check-box' : 'check-box-outline-blank'} size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const onSaveSelectedContacts = async () => {
    console.log(selectedContacts);
    // Save the selected contacts to local storage
    try {
      await AsyncStorage.setItem('selectedContacts', JSON.stringify(selectedContacts));
      console.log('Selected contacts saved to local storage');
      navigation.navigate('ContactList');
    } catch (error) {
      console.log('Error saving selected contacts to local storage:', error);
    }
  };

  return (
    <View style={styles.container} >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor="#CACACA"
          selectionColor="#CACACA"
          value={searchQuery}
          onChangeText={(query) => setSearchQuery(query)}
        />
      </View>
      <FlatList
        data={filteredContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.recordID}
      />
      <Button
        title="Save selected contacts"
        color="#B68D40"
        onPress={onSaveSelectedContacts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  searchContainer: {
    backgroundColor: '#FDFDFD',
    padding: 15,
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    color: '#000000',
    padding: 8,
    borderRadius: 8,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  txt: {
    color: "#000",
  },
});

export default AddContacts
