import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  StatusBar,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config/config";
import axiosInstance from "../axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import { Icon } from "react-native-paper";

const ProfileScreen = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  const navigation = useNavigation();

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setIsModalVisible(true);
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      setPerfil(null);
      setMessage(null);
      try {
        const response = await axiosInstance.get(config.AUTH.PROFILE);

        if (response.data) {
          setPerfil(response.data);
        //  showMessage("Perfil cargado exitosamente.", false);
        } else {
          showMessage(
            "Respuesta vacía del servidor al cargar el perfil.",
            true
          );
        }
      } catch (error) {
        console.error("Error al obtener el perfil:", error);
        let errorMessage = "Error desconocido al obtener el perfil.";

        if (error.response) {
          console.error(
            `Status: ${error.response.status}, Data: ${JSON.stringify(
              error.response.data
            )}`
          );
          if (error.response.status === 401) {
            errorMessage =
              "Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.";
            await SecureStore.deleteItemAsync("token");
            await AsyncStorage.removeItem("userName");
            navigation.replace("Login");
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage = `Error del servidor: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage =
            "No se pudo conectar con el servidor. Verifica tu conexión a internet o la IP del backend.";
        } else {
          errorMessage = `Error de la aplicación: ${error.message}`;
        }
        showMessage(`Error al obtener el perfil: ${errorMessage}`, true);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [navigation]);
  const handleLogout = async () => {
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync("token");
      await AsyncStorage.removeItem("userName");
      showMessage("Sesión cerrada exitosamente.", false);
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 2000);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showMessage("Error al cerrar sesión.", true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1A1A2E", "#16213E", "#0F3460"]
            : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
        }
        style={styles.gradient}
      >
        <SafeAreaView
          style={[{ flex: 1 }, { backgroundColor: currentTheme.primary }]} edges={['top', 'right', 'left', 'bottom']}
        >
          <StatusBar
            barStyle={isDarkMode ? "light-content" : "dark-content"}
            backgroundColor={currentTheme.primary}
            translucent
          />
          <View
            style={[
              styles.container,
              {
                backgroundColor: "transparent",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <ActivityIndicator size="large" color={currentTheme.accent} />
          </View>
        </SafeAreaView>
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
    >
      <SafeAreaView
        style={[{ flex: 1 }, { backgroundColor: currentTheme.primary }]} edges={['top', 'right', 'left', 'bottom']}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
          translucent
        />
        <View style={[styles.container, { backgroundColor: "transparent" }]}>
          <View style={styles.themeToggleContainer}>
            <Text style={[styles.themeText, { color: currentTheme.text }]}>
              {isDarkMode ? "Modo oscuro" : "Modo claro"}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#F27121" }}
              thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>

          <Text style={[styles.title, { color: currentTheme.accent }]}>
            Mi Perfil
          </Text>
          {perfil ? (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.cardBorder,
                },
              ]}
            >
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                ID:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {perfil.id}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Nombre:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {perfil.name}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Apellido:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {perfil.surname}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Email:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {perfil.email}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Teléfono:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {perfil.phoneNumber}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                DNI:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {perfil.dni}
                </Text>
              </Text>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.errorText, { color: currentTheme.text }]}>
                No se pudo cargar la información del perfil.
              </Text>
              <Pressable
                style={[
                  styles.retryButton,
                  { backgroundColor: currentTheme.buttonBg },
                ]}
                onPress={() => fetchPerfil()}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={[
              styles.logoutButton,
              {
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.error,
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.85}
            disabled={loading}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 3 }}>
                <Icon
                  source="logout"
                  size={20}
                  color={currentTheme.error}
                />
              </View>
              <Text style={[styles.logoutText, { color: currentTheme.error }]}>
                Cerrar sesión
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.cardBg },
            ]}
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
              style={[
                styles.modalButton,
                { backgroundColor: currentTheme.buttonBg },
              ]}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F27121",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#16213E",
    shadowColor: "#0F3460",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: "bold",
    color: "#16213E",
    marginBottom: 4,
    fontSize: 16,
  },
  value: {
    fontWeight: "normal",
    color: "#222",
    marginBottom: 8,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E94057",
    elevation: 2,
    shadowColor: "#E94057",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logoutText: {
    color: "#E94057",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
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
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalErrorText: {
    color: "#e74c3c",
  },
  modalSuccessText: {
    color: "green",
  },
  modalButton: {
    backgroundColor: "#4B9CE2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
  noDataContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  retryButton: {
    backgroundColor: "#4B9CE2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  themeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: "absolute",
    top: 40,
    right: 0,
    left: 0,
  },
  themeText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProfileScreen;
