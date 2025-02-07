import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Welcome from './src/screens/Welcome';
import OnBoarding from './src/screens/OnBoarding';
import TabNav from './src/screens/TabNav';
import AddContacts from './src/screens/AddContacts';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';

const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        <Stack.Screen name="OnBoarding" component={OnBoarding} options={{ headerShown: false }} />
        <Stack.Screen name="TabNav" component={TabNav} options={{ headerShown: false }} />
        <Stack.Screen name="AddContacts" component={AddContacts} options={{ title: 'Add Contacts', headerTintColor: '#B68D40', headerStyle: { backgroundColor: '#2A2E30' } }} />
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login', headerTintColor: '#B68D40', headerStyle: { backgroundColor: '#2A2E30' } }} />
        <Stack.Screen name="Signup" component={Signup} options={{ title: 'Signup', headerTintColor: '#B68D40', headerStyle: { backgroundColor: '#2A2E30' } }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
