import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  StatusBar,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axiosInstance";
import Input from "../Components/Input";
import { useNavigation } from "@react-navigation/native";
import config from "../config/config";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const LoginAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setIsModalVisible(true);
  };

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = await SecureStore.getItemAsync("token");
      if (savedToken) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    };
    checkToken();
  }, [navigation]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("Por favor, completa todos los campos.", true);
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Por favor, introduce un email válido.", true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${config.API_URL}${config.AUTH.LOGIN}`,
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      const name = response.data.name;
      if (token) {
        await SecureStore.setItemAsync("token", token);
        if (name) {
          await AsyncStorage.setItem("userName", name);
        }
        //showMessage('¡Bienvenido!', false);
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        showMessage("Token no recibido del servidor.", true);
      }
    } catch (error) {
      console.error("Error de login:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        "Credenciales incorrectas o problema de conexión.";
      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: 200,
          animated: true,
        });
      }, 100);
    }
  };

  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1A1A2E", "#16213E", "#0F3460"]
            : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
        }
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={currentTheme.accent} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Cargando...
        </Text>
      </LinearGradient>
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
      <SafeAreaView
        style={styles.container}
        edges={["top", "right", "left", "bottom"]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
        />
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: keyboardHeight + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="truck-delivery"
              size={80}
              color={currentTheme.accent}
            />
          </View>
          <Text style={[styles.title, { color: currentTheme.accent }]}>
            Iniciar Sesión
          </Text>
          <View
            style={[styles.formContainer, { backgroundColor: "transparent" }]}
          >
            <Input
              label="Correo electrónico"
              placeholder="Correo electrónico"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"
              }
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={handleInputFocus}
              style={styles.input}
              labelStyle={[
                styles.label,
                { color: isDarkMode ? "#fff" : "#333" },
              ]}
              inputStyle={{
                borderColor: isDarkMode ? "#fff" : "#333",
                borderWidth: 1,
                color: isDarkMode ? "#fff" : "#000",
                backgroundColor: isDarkMode
                  ? "transparent"
                  : "rgba(255, 255, 255, 0.7)",
              }}
            />
            <Input
              label="Contraseña"
              placeholder="Contraseña"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"
              }
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={handleInputFocus}
              style={styles.input}
              labelStyle={[
                styles.label,
                { color: isDarkMode ? "#fff" : "#333" },
              ]}
              inputStyle={{
                borderColor: isDarkMode ? "#fff" : "#333",
                borderWidth: 1,
                color: isDarkMode ? "#fff" : "#000",
                backgroundColor: isDarkMode
                  ? "transparent"
                  : "rgba(255, 255, 255, 0.7)",
              }}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={isDarkMode ? "#fff" : "#333"}
                  />
                </TouchableOpacity>
              }
            />
            {loading ? (
              <ActivityIndicator
                size="large"
                color={currentTheme.accent}
                style={styles.loadingSpinner}
              />
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={["#F27121", "#E94057"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>

          <View style={styles.links}>
            <Pressable onPress={() => navigation.navigate("RecoverPassword")}>
              <Text style={[styles.link, { color: currentTheme.accent }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate("Register", { screen: "Register" })
              }
            >
              <Text style={[styles.link, { color: currentTheme.accent }]}>
                ¿No tienes cuenta? Regístrate
              </Text>
            </Pressable>
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
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.cardBg },
              ]}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <Text
                style={[
                  styles.modalText,
                  message?.isError
                    ? styles.modalErrorText
                    : styles.modalSuccessText,
                ]}
              >
                {message?.text}
              </Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={["#F27121", "#E94057"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </LinearGradient>
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
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 5,
  },
  formContainer: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: "95%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: "Montserrat_400Regular",
  },
  loadingSpinner: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Montserrat_600SemiBold",
  },
  input: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    fontFamily: "Montserrat_400Regular",
    marginLeft: "2.5%",
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    fontFamily: "Montserrat_400Regular",
  },
  loginButton: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 5,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat_600SemiBold",
  },
  links: {
    marginTop: -10,
    alignItems: "center",
  },
  link: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: "Montserrat_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Montserrat_400Regular",
  },
  modalErrorText: {
    color: "#721c24",
  },
  modalSuccessText: {
    color: "#155724",
  },
  modalButton: {
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
  },
  modalButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});

export default LoginAuth;
