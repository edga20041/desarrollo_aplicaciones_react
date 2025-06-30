// src/screens/ProfileScreen.js

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
  ScrollView,
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
import { stopPeriodicNotifications } from "../service/NotificationService";
import { useUserArea } from "../context/UserAreaContext";
import supabase, { BUCKET_NAME } from "../config/supabase";

const ProfileScreen = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAreaModalVisible, setIsAreaModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");
  const [changingArea, setChangingArea] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { updateUserArea } = useUserArea();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const areas = ["Zona Norte", "Zona Sur", "Zona Oeste", "Zona Centro"];

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

  const uploadImageToSupabase = async (uri) => {
    try {
      setUploadingImage(true);

      // Convert URI to Blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate a unique file name using DNI
      const fileName = `${perfil.dni}_profile.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      setProfileImage(publicUrl);
      showMessage("Foto actualizada exitosamente", false);
    } catch (error) {
      console.error("Error uploading image:", error);
      showMessage(
        "Error al subir la imagen. Por favor intente nuevamente.",
        true
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProfilePhoto = async (dni) => {
    try {
      const fileName = `${dni}_profile.jpg`;
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      // Check if the image exists by trying to load it
      const response = await fetch(publicUrl);
      if (response.ok) {
        setProfileImage(publicUrl);
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
      // If there's an error or no photo exists, we'll use the default avatar
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImageToSupabase(result.assets[0].uri);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setIsModalVisible(true);
  };

  const handleChangeArea = async () => {
    if (!selectedArea) return;

    setChangingArea(true);
    try {
      const response = await axiosInstance.post(config.AUTH.CHANGE_AREA, {
        area: selectedArea,
      });

      if (response.status === 200) {
        setPerfil((prev) => ({ ...prev, area: selectedArea }));
        updateUserArea(selectedArea);
        showMessage("Zona actualizada exitosamente", false);
      }
    } catch (error) {
      let errorMessage = "Error al cambiar la zona.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showMessage(errorMessage, true);
    } finally {
      setChangingArea(false);
      setIsAreaModalVisible(false);
    }
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
          // Fetch profile photo once we have the DNI
          if (response.data.dni) {
            fetchProfilePhoto(response.data.dni);
          }
        } else {
          showMessage(
            "Respuesta vacía del servidor al cargar el perfil.",
            true
          );
        }
      } catch (error) {
        let errorMessage = "Error desconocido al obtener el perfil.";

        if (error.response) {
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
      stopPeriodicNotifications();
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
        <Pressable onPress={pickImage} disabled={uploadingImage}>
          <Animated.View
            style={[
              styles.profileImageContainer,
              { height: imageSize, width: imageSize },
            ]}
          >
            {uploadingImage ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("../../assets/avatar.png")
                }
                style={styles.profileImage}
              />
            )}
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
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
          edges={["top", "right", "left", "bottom"]}
        >
          <ActivityIndicator size="large" color={currentTheme.accent} />
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
        style={styles.container}
        edges={["top", "right", "left", "bottom"]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <Animated.ScrollView
          style={styles.container}
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
              <View style={styles.infoRow}>
                <Icon
                  source="map-marker-radius"
                  size={24}
                  color={currentTheme.accent}
                />
                <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  {perfil?.area || "No especificada"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.changeAreaButton,
                    { backgroundColor: currentTheme.accent },
                  ]}
                  onPress={() => {
                    setSelectedArea(perfil?.area || areas[0]);
                    setIsAreaModalVisible(true);
                  }}
                >
                  <Text style={styles.changeAreaButtonText}>Cambiar zona</Text>
                </TouchableOpacity>
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={isAreaModalVisible}
        onRequestClose={() => setIsAreaModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsAreaModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.cardBg },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Seleccionar Zona
            </Text>
            <ScrollView style={styles.areaList}>
              {areas.map((area) => (
                <TouchableOpacity
                  key={area}
                  style={[
                    styles.areaOption,
                    {
                      backgroundColor:
                        selectedArea === area
                          ? currentTheme.accent
                          : currentTheme.cardBg,
                    },
                  ]}
                  onPress={() => setSelectedArea(area)}
                >
                  <Text
                    style={[
                      styles.areaOptionText,
                      {
                        color:
                          selectedArea === area ? "#fff" : currentTheme.text,
                      },
                    ]}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: currentTheme.error },
                ]}
                onPress={() => setIsAreaModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: currentTheme.accent,
                    opacity: changingArea ? 0.7 : 1,
                  },
                ]}
                onPress={handleChangeArea}
                disabled={changingArea}
              >
                {changingArea ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
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
  changeAreaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: "auto",
  },
  changeAreaButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  areaList: {
    maxHeight: 200,
    width: "100%",
  },
  areaOption: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  areaOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});

export default ProfileScreen;
