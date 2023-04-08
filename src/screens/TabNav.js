import React from 'react';
import { Text } from "react-native";
import Ionic from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from 'react-native-gesture-handler';
import Home from './Home';
import ContactList from './ContactList';
import Account from './Account';
import Test from './Testt';

const TabNav = ({navigation}) => {
    const Tab = createBottomTabNavigator();
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarActiveTintColor: "#B68D40",
                tabBarInactiveTintColor: '#b8a481',
                tabBarShowLabel: false,
                tabBarStyle: [
                    {
                        display: 'flex',
                        backgroundColor: '#FFFF',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        position: 'absolute'
                    },
                    null
                ]
            }}>
            <Tab.Screen name="Home" component={Home} options={{
                tabBarLabel: 'Home',
                headerTintColor: '#B68D40',
                headerStyle: {
                    backgroundColor: '#2A2E30',
                },
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "home" : "home-outline"} color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="ContactList" component={ContactList} options={{
                title: 'Contact List',
                headerTintColor: '#B68D40',
                headerStyle: {
                    backgroundColor: '#2A2E30',
                },
                headerRight: () => (
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('AddContacts');
                      }}>
                    <Ionic name="add" color="#B68D40" size={30} style={{paddingRight: 10}}/>
                    </TouchableOpacity>
                  ),
                tabBarLabel: 'Contacts',
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "book" : "book-outline"} color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="AccountDetails" component={Account} options={{
                title: 'Account Details',
                headerTintColor: '#B68D40',
                headerStyle: {
                    backgroundColor: '#2A2E30',
                },
                tabBarLabel: 'Account',
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "person" : "person-outline"} color={color} size={size} />
                ),
            }}/>
            <Tab.Screen name="Test" component={Test} options={{
                tabBarLabel: 'Test',
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "settings" : "settings-outline"} color={color} size={size} />
                ),
            }}/>
        </Tab.Navigator>
    );
}

export default TabNav;
