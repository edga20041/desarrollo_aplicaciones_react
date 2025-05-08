import React, { useState } from 'react';
import { View, TextInput, Button, ToastAndroid } from 'react-native';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:8081/auth/reset-password', {
        token,
        newPassword,
      });

      ToastAndroid.show(response.data.message || "Contraseña restablecida.", ToastAndroid.SHORT);
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      ToastAndroid.show("Error al restablecer la contraseña.", ToastAndroid.SHORT);
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
