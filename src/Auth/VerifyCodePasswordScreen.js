import React, { useState } from 'react';
import { View, TextInput, Button, ToastAndroid } from 'react-native';
import axios from 'axios';

const VerifyCodePasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');

  const handleVerifyCode = async () => {
    if (!code) {
      ToastAndroid.show("Por favor, ingresa el código.", ToastAndroid.SHORT);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/auth/validate-recovery-code', { email, code });

      if (response.data?.message === "Código válido") {
        ToastAndroid.show("Código verificado.", ToastAndroid.SHORT);
        const token = response.data.token;
        navigation.navigate('ResetPassword', { email, token });
      } else {
        ToastAndroid.show("Código inválido. Intenta de nuevo.", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error(error);
      ToastAndroid.show("Error de red. Intenta de nuevo.", ToastAndroid.SHORT);
    }
  };

  const handleResendCode = async () => {
    ToastAndroid.show("Enviando código nuevo...", ToastAndroid.SHORT);
    try {
      await axios.post('http://TU_BACKEND/resend-recovery-code', { email });
      ToastAndroid.show("Código reenviado.", ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show("Error al reenviar el código.", ToastAndroid.SHORT);
    }
  };

  return (
    <View>
      <TextInput placeholder="Código de verificación" value={code} onChangeText={setCode} />
      <Button title="Verificar código" onPress={handleVerifyCode} />
      <Button title="Reenviar código" onPress={handleResendCode} />
    </View>
  );
};

export default VerifyCodePasswordScreen;
