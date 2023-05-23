
import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import MainScreen from './src/screens/MainScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen'

const Stack = createNativeStackNavigator()

function App() {
  return (

    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: 'fade' }} initialRouteName='Splash'>
        <Stack.Screen options={{ headerShown: false }} name='Splash' component={SplashScreen} />
        <Stack.Screen options={{ headerShown: false }} name='Home' component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}

export default App;
