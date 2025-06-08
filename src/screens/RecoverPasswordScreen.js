import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ToastAndroid,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  StatusBar,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import config from "../config/config";
import Input from "../Components/Input";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const RecoverPasswordScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const windowHeight = Dimensions.get("window").height;

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

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

  const handleInputFocus = (event) => {
    if (scrollViewRef.current) {
      const fieldY = event.nativeEvent.target;

      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: fieldY - windowHeight * 0.3,
          animated: true,
        });
      }, 100);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.accent} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Cargando...
        </Text>
      </View>
    );
  }

  const handleRecoverPassword = async () => {
    if (!email) {
      ToastAndroid.show(
        "Por favor, ingresa tu correo electrónico.",
        ToastAndroid.SHORT
      );
      return;
    }

    setLoading(true);
    ToastAndroid.show("Enviando código de verificación...", ToastAndroid.LONG);

    try {
      await axios.post(`${config.API_URL}${config.AUTH.RECOVER}`, { email });
      ToastAndroid.show(
        "Correo enviado con un código de verificación.",
        ToastAndroid.SHORT
      );
      navigation.navigate("VerifyCodePassword", { email });
    } catch (error) {
      console.error(error);
      ToastAndroid.show(
        "No se pudo enviar el correo. Verifica el email.",
        ToastAndroid.SHORT
      );
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>
              Recuperar contraseña
            </Text>

            <Input
              label="Correo electrónico"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={handleInputFocus}
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
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"
              }
            />
            <Text
              style={[
                styles.helperText,
                { color: isDarkMode ? "#fff" : "#333" },
              ]}
            >
              Ingresa el correo electrónico asociado a tu cuenta para recibir un
              código de recuperación.
            </Text>

            <View style={styles.buttonContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={currentTheme.accent} />
              ) : (
                <Pressable
                  onPress={handleRecoverPassword}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <LinearGradient
                    colors={["#F27121", "#E94057"]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Enviar código</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={() => navigation.navigate("Login")}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Text style={[styles.link, { color: currentTheme.accent }]}>
                  Volver al login
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RecoverPasswordScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    marginTop: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: -15,
  },
  formContainer: {
    padding: 20,
    borderRadius: 15,
    width: "95%",
    alignSelf: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Montserrat_600SemiBold",
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    fontFamily: "Montserrat_400Regular",
    marginLeft: "2.5%",
  },
  inputField: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    fontFamily: "Montserrat_400Regular",
  },
  helperText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Montserrat_400Regular",
  },
  buttonContainer: {
    marginBottom: 15,
    alignItems: "center",
    width: "100%",
  },
  button: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat_600SemiBold",
  },
  link: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
  },
});
