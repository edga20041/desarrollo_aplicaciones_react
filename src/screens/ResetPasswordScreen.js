import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, Pressable, StatusBar, ScrollView, Keyboard, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import config from '../config/config';
import Input from '../Components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../styles/theme';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { token, email } = route.params;
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const scrollViewRef = useRef(null);
  const windowHeight = Dimensions.get('window').height;

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setIsModalVisible(true);
  };

  const isValidPassword = (password) => {
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
        navigation.replace('Login');
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
        <ActivityIndicator size="large" color={currentTheme.accent} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ["#1A1A2E", "#16213E", "#0F3460"]
          : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
      }
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
        />
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: keyboardHeight + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.infoContainer}>
              <MaterialCommunityIcons name="lock-reset" size={50} color={currentTheme.accent} />
              <Text style={[styles.title, { color: currentTheme.accent }]}>Nueva Contraseña</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? "#fff" : "#666" }]}>
                {email ? `Establece una nueva contraseña para ${email}` : 'Establece tu nueva contraseña segura'}
              </Text>
            </View>

            <Input
              label="Nueva contraseña"
              placeholder="Ingresa tu nueva contraseña"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#555" }]}
              inputStyle={[styles.inputField, { 
                borderColor: isDarkMode ? "#fff" : "#ccc",
                color: isDarkMode ? "#fff" : "#333",
                backgroundColor: "transparent"
              }]}
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(prev => !prev)}>
                  <MaterialCommunityIcons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={isDarkMode ? "#fff" : "#666"}
                  />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirmar contraseña"
              placeholder="Confirma tu nueva contraseña"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#555" }]}
              inputStyle={[styles.inputField, { 
                borderColor: isDarkMode ? "#fff" : "#ccc",
                color: isDarkMode ? "#fff" : "#333",
                backgroundColor: "transparent"
              }]}
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={isDarkMode ? "#fff" : "#666"}
                  />
                </TouchableOpacity>
              }
            />

            <View style={[styles.passwordRequirements, { 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f8f9fa',
              borderLeftColor: currentTheme.accent
            }]}>
              <Text style={[styles.requirementsTitle, { color: isDarkMode ? "#fff" : "#333" }]}>
                Requisitos de la contraseña:
              </Text>
              <Text style={[styles.requirementItem, { color: isDarkMode ? "#ddd" : "#666" }]}>
                • Mínimo 8 caracteres
              </Text>
              <Text style={[styles.requirementItem, { color: isDarkMode ? "#ddd" : "#666" }]}>
                • Al menos una letra mayúscula
              </Text>
              <Text style={[styles.requirementItem, { color: isDarkMode ? "#ddd" : "#666" }]}>
                • Al menos una letra minúscula
              </Text>
              <Text style={[styles.requirementItem, { color: isDarkMode ? "#ddd" : "#666" }]}>
                • Al menos un número
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={currentTheme.accent} />
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
          </View>
        </ScrollView>

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
            <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1A1A2E' : 'white' }]}>
              <Text style={[
                styles.modalText,
                message?.isError ? styles.modalErrorText : styles.modalSuccessText,
                { color: isDarkMode ? '#fff' : '#000' }
              ]}>
                {message?.text}
              </Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && { opacity: 0.8 }
                ]}
              >
                <Text style={[styles.modalButtonText, { color: currentTheme.accent }]}>Cerrar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
  formContainer: {
    padding: 20,
    borderRadius: 15,
    width: '95%',
    alignSelf: 'center',
    alignItems: 'center'
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 22,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  passwordRequirements: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderLeftWidth: 4,
    width: '100%',
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 3,
  },
  resetButton: {
    width: '100%',
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  modalErrorText: {
    color: '#dc3545',
  },
  modalSuccessText: {
    color: '#28a745',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default ResetPasswordScreen;