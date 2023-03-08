import React from 'react';
import Ionic from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Home from './Home';
import ContactList from './ContactList';
import Account from './Account';
import Test from './Testt';

const TabNav = () => {
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
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "home" : "home-outline"} color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="ContactList" component={ContactList} options={{
                title: 'Contact List',
                headerRight: () => (
                    <Ionic name="add" color="black" size={30}/>
                  ),
                tabBarLabel: 'Contacts',
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "book" : "book-outline"} color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="AccountDetails" component={Account} options={{
                title: 'Account Details',
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
