import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import RegisterForm from "./RegisterForm";
import VerifyCode from "./VerifyCode";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const RegisterAuth = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [email, setEmail] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const formRef = useRef(null);
  const windowHeight = Dimensions.get("window").height;

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

  const handleRegisterSuccess = (registeredEmail) => {
    setEmail(registeredEmail);
    console.log("Email registrado:", registeredEmail);
  };

  const handleVerificationSuccess = () => {
    console.log("Intentando navegar a Login después de verificación exitosa");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
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
          <View ref={formRef} style={styles.formContainer}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>
              {email ? "Verifica tu Correo Electrónico" : "Registrarse"}
            </Text>
            {email ? (
              <VerifyCode
                email={email}
                onVerificationSuccess={handleVerificationSuccess}
              />
            ) : (
              <RegisterForm
                onRegisterSuccess={handleRegisterSuccess}
                onInputFocus={handleInputFocus}
              />
            )}
          </View>
        </ScrollView>
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
    justifyContent: "center",
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
});

export default RegisterAuth;
