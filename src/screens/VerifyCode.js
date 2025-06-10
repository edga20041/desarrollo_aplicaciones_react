import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  StatusBar,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import config from "../config/config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const VerifyCode = ({ email, onVerificationSuccess }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef([]);
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

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setIsModalVisible(true);
  };

  const handleVerify = async () => {
    console.log("Iniciando proceso de verificación...");
    console.log("Email usado:", email);
    console.log("Código a verificar:", code.join(""));

    if (code.some((digit) => !digit)) {
      console.log("Código incompleto:", code);
      showMessage("Por favor, ingrese el código completo", true);
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        email,
        code: code.join(""),
      };
      console.log("Datos enviados al servidor:", requestData);

      const response = await axios.post(
        `${config.API_URL}${config.AUTH.VERIFY}`,
        requestData
      );

      console.log("Respuesta completa del servidor:", {
        status: response.status,
        data: response.data,
      });

      if (response.data.token && response.data.userId) {
        console.log("Verificación exitosa, token y userId recibidos");
        showMessage(
          "¡Verificación Exitosa! Tu cuenta ha sido verificada correctamente.",
          false
        );
        setTimeout(() => {
          console.log("Ejecutando navegación con datos:", {
            userId: response.data.userId,
            name: response.data.name,
          });
          onVerificationSuccess();
        }, 1500);
      } else {
        console.log("Respuesta incompleta del servidor:", response.data);
        showMessage(
          "La verificación no fue exitosa. Por favor, intente nuevamente.",
          true
        );
      }
    } catch (err) {
      console.error("Error detallado en la verificación:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showMessage(
        err.response?.data?.message || "Error al verificar el código",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await axios.post(`${config.API_URL}${config.AUTH.RESEND_CODE}`, {
        email,
      });
      setTimeLeft(60);
      setCanResend(false);
      showMessage(
        "Se ha enviado un nuevo código a tu correo electrónico.",
        false
      );
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Error al reenviar el código",
        true
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
      <View style={styles.container}>
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
          <View style={styles.infoContainer}>
            <MaterialCommunityIcons
              name="email-check-outline"
              size={50}
              color={currentTheme.accent}
            />
            <Text
              style={[styles.infoText, { color: isDarkMode ? "#fff" : "#666" }]}
            >
              Hemos enviado un código de verificación a:
            </Text>
            <Text style={[styles.emailText, { color: currentTheme.accent }]}>
              {email}
            </Text>
          </View>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  {
                    borderColor: currentTheme.accent,
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            <Text
              style={[
                styles.timerText,
                { color: isDarkMode ? "#fff" : "#666" },
              ]}
            >
              {canResend
                ? "¿No recibiste el código?"
                : `Reenviar código en ${timeLeft}s`}
            </Text>
            {canResend && (
              <Pressable
                onPress={handleResendCode}
                disabled={loading}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Text
                  style={[styles.resendText, { color: currentTheme.accent }]}
                >
                  Reenviar código
                </Text>
              </Pressable>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={currentTheme.accent} />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.verifyButton,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleVerify}
            >
              <LinearGradient
                colors={["#F27121", "#E94057"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.verifyButtonText}>Verificar Código</Text>
              </LinearGradient>
            </Pressable>
          )}
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
                { backgroundColor: isDarkMode ? "#1A1A2E" : "white" },
              ]}
            >
              <Text
                style={[
                  styles.modalText,
                  message?.isError
                    ? styles.modalErrorText
                    : styles.modalSuccessText,
                  { color: isDarkMode ? "#fff" : "#000" },
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
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: currentTheme.accent },
                  ]}
                >
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
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
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Montserrat_400Regular",
  },
  emailText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    fontFamily: "Montserrat_600SemiBold",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderRadius: 10,
    marginHorizontal: 5,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Montserrat_600SemiBold",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    marginBottom: 5,
    fontFamily: "Montserrat_400Regular",
  },
  resendText: {
    textDecorationLine: "underline",
    fontFamily: "Montserrat_600SemiBold",
  },
  verifyButton: {
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
  verifyButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat_600SemiBold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Montserrat_400Regular",
  },
  modalErrorText: {
    color: "#dc3545",
  },
  modalSuccessText: {
    color: "#28a745",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
});

export default VerifyCode;
