import React, { useState } from 'react';
import { View, TextInput, Button, ToastAndroid } from 'react-native';
import axios from 'axios';
import config from '../config/config';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { token } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      ToastAndroid.show("Por favor, completa ambos campos.", ToastAndroid.SHORT);
      return;
    }

    if (newPassword !== confirmPassword) {
      ToastAndroid.show("Las contraseñas no coinciden.", ToastAndroid.SHORT);
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}${config.AUTH.RESET}`, {
        token,
        newPassword,
      });

      ToastAndroid.show(response.data.message || "Contraseña restablecida.", ToastAndroid.SHORT);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      
      let errorMessage = "Error al restablecer la contraseña.";
      if (error.response) {
        console.log('Datos del error:', error.response.data);
        console.log('Estado del error:', error.response.status);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        console.log('Error de solicitud:', error.request);
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
      }
      
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    }
  };

  return (
    <View>
      <TextInput placeholder="Nueva contraseña" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <TextInput placeholder="Confirmar contraseña" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      <Button title="Restablecer contraseña" onPress={handleResetPassword} />
    </View>
  );
};

export default ResetPasswordScreen;