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
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config/config";
import axiosInstance from "../axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import { Icon } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { SharedElement } from "react-navigation-shared-element";

const ProfileScreen = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [profileImage, setProfileImage] = useState(null);
  const [scrollY] = useState(new Animated.Value(0));

  const navigation = useNavigation();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [200, 80],
    extrapolate: "clamp",
  });

  const imageSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [120, 40],
    extrapolate: "clamp",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

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

  const renderProfileHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <LinearGradient
        colors={isDarkMode ? ["#1A1A2E", "#16213E"] : ["#F27121", "#E94057"]}
        style={styles.headerGradient}
      >
        <Pressable onPress={pickImage}>
          <Animated.View
            style={[
              styles.profileImageContainer,
              { height: imageSize, width: imageSize },
            ]}
          >
            <Image
              source={require("../../assets/avatar.png")}
              style={styles.profileImage}
            />
            <View style={styles.editImageButton}>
              <Icon source="camera" size={16} color="#fff" />
            </View>
          </Animated.View>
        </Pressable>
        <Text style={styles.profileName}>
          {perfil?.name} {perfil?.surname}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderProfileOption = (icon, title, onPress) => (
    <TouchableOpacity
      style={[styles.optionCard, { backgroundColor: currentTheme.cardBg }]}
      onPress={onPress}
    >
      <Icon source={icon} size={24} color={currentTheme.accent} />
      <Text style={[styles.optionText, { color: currentTheme.text }]}>
        {title}
      </Text>
      <Icon source="chevron-right" size={24} color={currentTheme.accent} />
    </TouchableOpacity>
  );

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
          style={[{ flex: 1 }, { backgroundColor: "transparent" }]}
          edges={["top", "right", "left", "bottom"]}
        >
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
        style={[{ flex: 1 }, { backgroundColor: "transparent" }]}
        edges={["top", "right", "left", "bottom"]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <Animated.ScrollView
          style={[styles.container, { backgroundColor: "transparent" }]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderProfileHeader()}

          <View style={styles.content}>
            <View
              style={[styles.card, { backgroundColor: currentTheme.cardBg }]}
            >
              <View style={styles.infoRow}>
                <Icon source="email" size={24} color={currentTheme.accent} />
                <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  {perfil?.email}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon source="phone" size={24} color={currentTheme.accent} />
                <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  {perfil?.phoneNumber}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  source="card-account-details"
                  size={24}
                  color={currentTheme.accent}
                />
                <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  {perfil?.dni}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: currentTheme.error },
              ]}
              onPress={handleLogout}
            >
              <Icon source="logout" size={24} color="#fff" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>

        <View style={styles.themeToggleContainer}>
          <Icon
            source={isDarkMode ? "weather-night" : "weather-sunny"}
            size={24}
            color={currentTheme.text}
          />
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#F27121" }}
            thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
          />
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
  },
  header: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileImageContainer: {
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  themeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 5,
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
});

export default ProfileScreen;
