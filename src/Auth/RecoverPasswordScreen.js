import React, { useState } from 'react';
import { View, Text, TextInput, Button, ToastAndroid, StyleSheet } from 'react-native';
import axios from 'axios';
import config from '../config/config';
import Input from '../Components/Input';

const RecoverPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleRecoverPassword = async () => {
    if (!email) {
      ToastAndroid.show("Por favor, ingresa tu correo electrónico.", ToastAndroid.SHORT);
      return;
    }

    ToastAndroid.show("Enviando código de verificación...", ToastAndroid.LONG);

    try {
      await axios.post(`${config.API_URL}${config.AUTH.RECOVER}`, { email });
      ToastAndroid.show("Correo enviado con un código de verificación.", ToastAndroid.SHORT);
      navigation.navigate('VerifyCodePassword', { email });
    } catch (error) {
      console.error(error);
      ToastAndroid.show("No se pudo enviar el correo. Verifica el email.", ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Input
        label="Correo electrónico"
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.buttonContainer}>
        <Button title="Enviar código" onPress={handleRecoverPassword} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Volver al login" onPress={() => navigation.navigate('Login')} color="blue" />
      </View>
    </View>
  );
};

export default RecoverPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#blue',
  },
  buttonContainer: {
    marginBottom: 10,
  },
});
