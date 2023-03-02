import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import TabNav from './src/screens/TabNav';
import AddContacts from './src/screens/AddContacts';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';

const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="TabNav" component={TabNav} options={{headerShown: false}}/>
        <Stack.Screen name="AddContacts" component={AddContacts} options={{title: 'AddContacts'}}/>
        <Stack.Screen name="Login" component={Login} options={{title: 'Login'}}/>
        <Stack.Screen name="Signup" component={Signup} options={{title: 'Signup'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
