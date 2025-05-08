import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';
import RegisterAuth from './src/Auth/RegisterAuth';
import LoginAuth from './src/Auth/LoginAuth';
import RecoverPasswordScreen from './src/Auth/RecoverPasswordScreen';
import VerifyCodePasswordScreen from './src/Auth/VerifyCodePasswordScreen';
import ResetPasswordScreen from './src/Auth/ResetPasswordScreen';
import ProfileScreen from './src/Auth/ProfileScreen'; 

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la App</Text>
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
       <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} /> 
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterAuth} />
        <Stack.Screen name="Login" component={LoginAuth} />
        <Stack.Screen name="Profile" component={ProfileScreen} /> 
        
        <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
        <Stack.Screen name="VerifyCodePassword" component={VerifyCodePasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});