import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import EntregasPendientes from "../Components/EntregasPendientes";
import HistorialEntregas from "../Components/HistorialEntregas";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import { Icon } from "react-native-paper";

const MainScreen = () => {
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [showDefaultView, setShowDefaultView] = useState(true);
  const [showEntregas, setShowEntregas] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [refreshEntregas, setRefreshEntregas] = useState(false);
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  useFocusEffect(
    React.useCallback(() => {
      setRefreshEntregas((prev) => !prev);
    }, [])
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        navigation.reset("Login");
      }
    };
    checkAuthentication();

    const fetchUserName = async () => {
      const name = await AsyncStorage.getItem("userName");
      setUserName(name || "Usuario");
    };
    fetchUserName();

    const getGreeting = () => {
      const now = new Date();
      const hour =
        now.getUTCHours() - 3 < 0
          ? now.getUTCHours() + 21
          : now.getUTCHours() - 3;
      if (hour >= 6 && hour < 12) return "¡Buenos días";
      if (hour >= 12 && hour < 20) return "¡Buenas tardes";
      return "¡Buenas noches";
    };
    setGreeting(getGreeting());
  }, [navigation]);

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
        style={styles.safeArea}
        edges={["top", "right", "left", "bottom"]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
          translucent
        />
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.navigate("ProfileScreen")}
              style={({ pressed }) => [
                styles.profileIcon,
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
                {
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.cardBorder,
                },
              ]}
            >
              <Icon
                source="account-circle-outline"
                size={36}
                color={currentTheme.text}
              />
            </Pressable>
            <Text style={styles.greeting}>
              <Text style={{ fontWeight: "bold", color: currentTheme.text }}>
                {greeting}
              </Text>
              <Text style={{ color: currentTheme.accent }}> {userName}!</Text>
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.customButton, showEntregas && styles.activeButton]}
              onPress={() => {
                setShowDefaultView(false);
                setShowEntregas(true);
                setShowHistorial(false);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  showEntregas
                    ? ["#E94057", "#F27121"]
                    : [currentTheme.cardBg, currentTheme.cardBg]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 3 }}>
                    <Icon
                      source="format-list-bulleted"
                      size={20}
                      color={showEntregas ? "#fff" : currentTheme.text}
                    />
                  </View>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: showEntregas ? "#fff" : currentTheme.text },
                    ]}
                  >
                    Ver Entregas
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={[
                styles.customButton,
                showHistorial && styles.activeButton,
              ]}
              onPress={() => {
                setShowDefaultView(false);
                setShowEntregas(false);
                setShowHistorial(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  showHistorial
                    ? ["#E94057", "#F27121"]
                    : [currentTheme.cardBg, currentTheme.cardBg]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 3 }}>
                    <Icon
                      source="truck-delivery-outline"
                      size={20}
                      color={showHistorial ? "#fff" : currentTheme.text}
                    />
                  </View>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: showHistorial ? "#fff" : currentTheme.text },
                    ]}
                  >
                    Ver Historial
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
          <View
            style={[
              styles.fragmentContainer,
              { backgroundColor: "transparent" },
            ]}
          >
            {showDefaultView && (
              <>
                <Text
                  style={[styles.sectionTitle, { color: currentTheme.text }]}
                >
                  Siguientes{" "}
                  <Text
                    style={{ color: currentTheme.accent, fontWeight: "bold" }}
                  >
                    2
                  </Text>{" "}
                  entregas
                </Text>
                <EntregasPendientes refresh={refreshEntregas} limitItems={2} />
              </>
            )}
            {showEntregas && <EntregasPendientes refresh={refreshEntregas} />}
            {showHistorial && <HistorialEntregas />}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: 5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    borderWidth: 2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 0,
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 30,
    gap: 10,
  },
  customButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#2d3a4b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activeButton: {
    elevation: 4,
    shadowOpacity: 0.18,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  fragmentContainer: {
    flex: 1,
    width: "100%",
  },
  logoutContainer: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 20,
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
  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // o currentTheme.cardBg si lo preferís dinámico
    borderColor: "#e0e0e0", // o currentTheme.cardBorder
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginRight: 5,
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});

export default MainScreen;
