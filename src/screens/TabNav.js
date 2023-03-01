import React from 'react';
import Ionic from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Home from './Home';
import ContactList from './ContactList';
import Test from './Testt';

const TabNav = () => {
    const Tab = createBottomTabNavigator();
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarActiveTintColor: "#B68D40",
                tabBarInactiveTintColor: '#b8a481',
                // tabBarShowLabel: false,
                tabBarStyle: [
                    {
                        display: 'flex'
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
                tabBarLabel: 'Contacts',
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "people" : "people-outline"} color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="Test" component={Test} options={{
                tabBarLabel: 'Contacts',
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionic name={focused ? "settings" : "settings-outline"} color={color} size={size} />
                ),
            }}/>
        </Tab.Navigator>
    );
}

export default TabNav;
