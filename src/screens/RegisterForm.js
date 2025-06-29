import React, { useState } from "react";
import Input from "../Components/Input";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import axios from "axios";
import config from "../config/config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const validateFields = (
  nombre,
  apellido,
  dni,
  phoneNumber,
  email,
  password,
  confirmPassword
) => {
  // Validaciones (descomentá si querés activarlas)

  if (
    !nombre ||
    !apellido ||
    !dni ||
    !phoneNumber ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    return { valid: false, message: "Todos los campos son obligatorios." };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "Las contraseñas no coinciden." };
  }
  if (dni.length < 7 || dni.length > 8) {
    return { valid: false, message: "El DNI debe tener 7 o 8 dígitos." };
  }
  if (phoneNumber.length < 7 || phoneNumber.length > 15) {
    return {
      valid: false,
      message: "El número de teléfono debe tener entre 7 y 15 dígitos.",
    };
  }
  if (!/^\d+$/.test(dni)) {
    return { valid: false, message: "El DNI solo puede contener dígitos." };
  }
  if (!/^\d+$/.test(phoneNumber)) {
    return {
      valid: false,
      message: "El número de teléfono solo puede contener dígitos.",
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "El formato del email es inválido." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      message: "La contraseña debe tener al menos 6 caracteres.",
    };
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
    return {
      valid: false,
      message:
        "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número.",
    };
  }
  if (!/^[a-zA-Z ]+$/.test(nombre)) {
    return { valid: false, message: "El nombre solo puede contener letras y espacios." };
  }
  if (!/^[a-zA-Z ]+$/.test(apellido)) {
    return { valid: false, message: "El apellido solo puede contener letras y espacios." };
  }
  if (nombre.length < 2 || apellido.length < 2) {
    return {
      valid: false,
      message: "El nombre y el apellido deben tener al menos 2 caracteres.",
    };
  }

  return { valid: true };
};

const RegisterForm = ({ onRegisterSuccess, onInputFocus }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [area, setArea] = useState("Zona Norte");
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const areas = ["Zona Norte", "Zona Sur", "Zona Oeste", "Zona Centro"];

  const showErrorModal = (msg) => {
    setError(msg);
    setIsModalVisible(true);
  };

  const handleRegister = async () => {
    setError(null);
    // Eliminar espacios al inicio y final
    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();
    const validationResult = validateFields(
      trimmedName,
      trimmedSurname,
      dni,
      phoneNumber,
      email,
      password,
      confirmPassword
    );

    if (!validationResult.valid) {
      showErrorModal(validationResult.message || "Error de validación.");
      return;
    }

    const registerRequest = {
      email,
      password,
      name: trimmedName,
      surname: trimmedSurname,
      dni: Number(dni),
      phoneNumber: Number(phoneNumber),
      area,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        `${config.API_URL}${config.AUTH.REGISTER}`,
        registerRequest
      );
      onRegisterSuccess(email);
    } catch (err) {
      let errorMessage = "Ocurrió un error. Intenta nuevamente.";
      if (err.response) {
        const status = err.response.status;
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (status === 400) {
          errorMessage = "El usuario ya está registrado o datos inválidos.";
        } else if (status >= 500) {
          errorMessage = "Error del servidor. Intenta más tarde.";
        }
      } else if (err.request) {
        errorMessage = "No se recibió respuesta del servidor. Revisa tu conexión a internet.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      showErrorModal(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.formContainer, { backgroundColor: "transparent" }]}>
      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Ingrese su nombre"
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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
      <Input
        label="Apellido"
        value={surname}
        onChangeText={setSurname}
        placeholder="Ingrese su apellido"
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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
      <Input
        label="DNI"
        value={dni}
        onChangeText={setDni}
        placeholder="Ingrese su DNI"
        keyboardType="numeric"
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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
      <Input
        label="Teléfono"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Ingrese su teléfono"
        keyboardType="numeric"
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Ingrese su email"
        keyboardType="email-address"
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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

      <View style={styles.pickerContainer}>
        <Text style={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}>
          Área
        </Text>
        <TouchableOpacity
          onPress={() => setShowAreaPicker(true)}
          style={[
            styles.pickerButton,
            {
              borderColor: isDarkMode ? "#fff" : "#333",
              borderWidth: 1,
              backgroundColor: isDarkMode
                ? "transparent"
                : "rgba(255, 255, 255, 0.7)",
            },
          ]}
        >
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>{area}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color={isDarkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAreaPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAreaPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDarkMode ? "#1A1A2E" : "#fff",
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? "#fff" : "#333" },
              ]}
            >
              Selecciona tu área
            </Text>
            {areas.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.areaOption,
                  area === item && {
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  },
                ]}
                onPress={() => {
                  setArea(item);
                  setShowAreaPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.areaOptionText,
                    { color: isDarkMode ? "#fff" : "#333" },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAreaPicker(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Ingrese su contraseña"
        secureTextEntry={!showPassword}
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={isDarkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>
        }
      />
      <Input
        label="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirme su contraseña"
        secureTextEntry={!showConfirmPassword}
        onFocus={onInputFocus}
        labelStyle={[styles.label, { color: isDarkMode ? "#fff" : "#333" }]}
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
        rightIcon={
          <TouchableOpacity
            onPress={() => setShowConfirmPassword((prev) => !prev)}
          >
            <MaterialCommunityIcons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={isDarkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>
        }
      />
      {error && (
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
                { backgroundColor: isDarkMode ? "#1A1A2E" : currentTheme.cardBg },
              ]}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <Text style={[styles.modalText, { color: isDarkMode ? '#ff6b6b' : '#721c24' }]}>Error: {error}</Text>
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
      )}

      {loading ? (
        <ActivityIndicator size="large" color={currentTheme.accent} />
      ) : (
        <Pressable
          onPress={handleRegister}
          style={({ pressed }) => [
            styles.registerButton,
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={["#F27121", "#E94057"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
    );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
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
  errorContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    fontFamily: "Montserrat_400Regular",
  },
  registerButton: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat_600SemiBold",
  },
  pickerContainer: {
    width: "95%",
    alignSelf: "center",
    marginBottom: 15,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: 15,
    textAlign: "center",
  },
  areaOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  areaOptionText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#E94057",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 10,
    textAlign: "center",
  },
  modalButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  modalButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
});

export default RegisterForm;
