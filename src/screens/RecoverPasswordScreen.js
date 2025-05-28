import React, { useState } from 'react';
import { View, Text, ToastAndroid, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import axios from 'axios';
import config from '../config/config';
import Input from '../Components/Input';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';

const RecoverPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E94057" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const handleRecoverPassword = async () => {
    if (!email) {
      ToastAndroid.show("Por favor, ingresa tu correo electrónico.", ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    ToastAndroid.show("Enviando código de verificación...", ToastAndroid.LONG);

    try {
      await axios.post(`${config.API_URL}${config.AUTH.RECOVER}`, { email });
      ToastAndroid.show("Correo enviado con un código de verificación.", ToastAndroid.SHORT);
      navigation.navigate('VerifyCodePassword', { email });
    } catch (error) {
      console.error(error);
      ToastAndroid.show("No se pudo enviar el correo. Verifica el email.", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
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
        labelStyle={styles.label}
        inputStyle={styles.inputField}
      />
      <Text style={styles.helperText}>
        Ingresa el correo electrónico asociado a tu cuenta para recibir un código de recuperación.
      </Text>

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6F00" />
        ) : (
          <Pressable onPress={handleRecoverPassword} activeOpacity={0.8}>
            <LinearGradient
              colors={['#E94057', '#F27121']}
              style={styles.orangeButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Enviar código</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
          <Text style={styles.link}>Volver al login</Text>
        </Pressable>
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
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    color: 'black',
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  inputField: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'black',
    fontFamily: 'Montserrat_400Regular',
  },
  helperText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  buttonContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  orangeButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#FB8C00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
});
