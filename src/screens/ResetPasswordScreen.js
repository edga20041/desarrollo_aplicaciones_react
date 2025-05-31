import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../config/config';
import Input from '../Components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { token, email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setIsModalVisible(true);
  };

  const isValidPassword = (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showMessage("Por favor, completa ambos campos.", true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Las contraseñas no coinciden.", true);
      return;
    }

    if (!isValidPassword(newPassword)) {
      showMessage("La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.", true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}${config.AUTH.RESET}`, {
        token,
        newPassword,
      });

      showMessage(response.data.message || "¡Contraseña restablecida con éxito!", false);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
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

      showMessage(errorMessage, true);
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
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <Text style={styles.title}>Nueva Contraseña</Text>
        <Text style={styles.subtitle}>
          {email ? `Establece una nueva contraseña para ${email}` : 'Establece tu nueva contraseña segura'}
        </Text>

        <Input
            label="Nueva contraseña"
            placeholder="Ingresa tu nueva contraseña"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            labelStyle={styles.label}
            inputStyle={styles.inputField}
        />

        <Input
            label="Confirmar contraseña"
            placeholder="Confirma tu nueva contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            labelStyle={styles.label}
            inputStyle={styles.inputField}
        />

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
          <Text style={styles.requirementItem}>• Mínimo 8 caracteres</Text>
          <Text style={styles.requirementItem}>• Al menos una letra mayúscula</Text>
          <Text style={styles.requirementItem}>• Al menos una letra minúscula</Text>
          <Text style={styles.requirementItem}>• Al menos un número</Text>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#E94057" style={styles.loadingSpinner} />
        ) : (
            <Pressable
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && { opacity: 0.9 }
                ]}
                onPress={handleResetPassword}
            >
              <LinearGradient colors={['#F27121', '#E94057']} style={styles.buttonGradient}>
                <Text style={styles.resetButtonText}>Restablecer Contraseña</Text>
              </LinearGradient>
            </Pressable>
        )}

        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
          <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
              <Text style={[styles.modalText, message?.isError ? styles.modalErrorText : styles.modalSuccessText]}>
                {message?.text}
              </Text>
              <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed && { opacity: 0.8 }
                  ]}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
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
    fontFamily: 'Montserrat_400Regular',
  },
  loadingSpinner: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    lineHeight: 22,
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
  passwordRequirements: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#E94057',
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    marginBottom: 3,
  },
  resetButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  modalErrorText: {
    color: '#e74c3c',
  },
  modalSuccessText: {
    color: 'green',
  },
  modalButton: {
    backgroundColor: '#4B9CE2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
});

export default ResetPasswordScreen;