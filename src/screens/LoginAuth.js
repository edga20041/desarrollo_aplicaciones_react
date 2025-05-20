import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../axiosInstance';
import Input from '../Components/Input';
import { useNavigation } from '@react-navigation/native';
import config from '../config/config';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const LoginAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    };
    checkToken();
  }, [navigation]);

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, introduce un email válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}${config.AUTH.LOGIN}`, {
        email,
        password,
      });

      const token = response.data.token;
      const name = response.data.name;
      if (token) {
        await AsyncStorage.setItem('token', token);
        if (name) {
          await AsyncStorage.setItem('userName', name);
        }
        Alert.alert('Login exitoso', '¡Bienvenido!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Token no recibido.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Credenciales incorrectas o problema de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E94057" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Input
        label="Correo electrónico"
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        labelStyle={styles.label}
        inputStyle={styles.inputField}
      />
      <Input
        label="Contraseña"
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        labelStyle={styles.label}
        inputStyle={styles.inputField}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#E94057" />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <LinearGradient colors={['#F27121', '#E94057']} style={styles.buttonGradient}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('RecoverPassword')}>
          <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoGradient: {
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    color: 'black',
  },
  input: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
  loginButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  links: {
    marginTop: 30,
    alignItems: 'center',
  },
  link: {
    color: '#007AFF',
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
});

export default LoginAuth;