import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './src/RegisterScreen'; // Importa el componente RegisterScreen
import VerifyCodeScreen from './src/VerifyCodeScreen'; // Importa el componente VerifyCodeScreen
//import HomeScreen from './HomeScreen';  //Importa la HomeScreen
import axios from 'axios'; // Importa axios para realizar peticiones HTTP

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        {/* Define las pantallas de tu aplicación */}
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ title: 'Verificación de Código' }} />
        {/*<Stack.Screen name="Home" component={HomeScreen} options={{title: 'Home'}}/>*/}
        {/* Agrega aquí otras pantallas que tengas (Login, Home, etc.) */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});