import React, { useState } from 'react';
import { View, Text, TextInput, Button, ToastAndroid } from 'react-native';
import axios from 'axios';
import config from '../config/config';

const RecoverPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleRecoverPassword = async () => {
    if (!email) {
      ToastAndroid.show("Por favor, ingresa tu correo electrónico.", ToastAndroid.SHORT);
      return;
    }

    ToastAndroid.show("Enviando código de verificación...", ToastAndroid.LONG);

    try {
      await axios.post( `${config.API_URL}${config.AUTH.RECOVER}`,
         { email });
      ToastAndroid.show("Correo enviado con un código de verificación.", ToastAndroid.SHORT);
      navigation.navigate('VerifyCodePassword', { email });
    } catch (error) {
      console.error(error);
      ToastAndroid.show("No se pudo enviar el correo. Verifica el email.", ToastAndroid.SHORT);
    }
  };

  return (
    <View>
      <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} />
      <Button title="Recuperar contraseña" onPress={handleRecoverPassword} />
      <Button title="Volver al login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

export default RecoverPasswordScreen;
