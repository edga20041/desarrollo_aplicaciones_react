import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import RegisterAuth from './src/Auth/RegisterAuth';
import LoginAuth from './src/Auth/LoginAuth';
import RecoverPasswordScreen from './src/Auth/RecoverPasswordScreen';
import VerifyCodePasswordScreen from './src/Auth/VerifyCodePasswordScreen';
import ResetPasswordScreen from './src/Auth/ResetPasswordScreen';
import ProfileScreen from './src/Auth/ProfileScreen'; 

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.gradientBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#232526" />
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido a DeRemate</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.buttonText}>Ir al Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  gradientBackground: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #232526 0%, #414345 100%)', // fallback para RN puro
    backgroundColor: '#232526', // para que no falle en RN puro
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    letterSpacing: 1,
    textShadowColor: '#0008',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    width: '100%',
    backgroundColor: '#6a11cb',
    paddingVertical: 16,
    borderRadius: 16,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});