import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../axiosInstance';
import Input from '../Components/Input';
import { useNavigation } from '@react-navigation/native';
import config from '../config/config';

const LoginAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

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
  }, []);

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
        Alert.alert('Login exitoso', 'Bienvenido!');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Input
        label="Correo electrónico"
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Contraseña"
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Iniciar sesión" onPress={handleLogin} />
      )}
      <View style={styles.links}>
        <Text style={styles.link} onPress={() => navigation.navigate('RecoverPassword')}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>¿No tienes cuenta? Regístrate</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 35, flex: 1, justifyContent: 'center', backgroundColor: 'white'},
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color:'#333'},
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  links: { marginTop: 20, alignItems: 'center' },
  link: { color: 'blue', marginTop: 10 },
});

export default LoginAuth;
