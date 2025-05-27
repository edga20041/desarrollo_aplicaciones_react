import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import EntregasPendientes from "../Components/EntregasPendientes";
import HistorialEntregas from "../Components/HistorialEntregas";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const MainScreen = () => {
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
          translucent
        />
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileScreen")}
            >
              <Image
                source={require("../../assets/avatar.png")}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.cardBorder,
                  },
                ]}
              />
            </TouchableOpacity>
            <Text style={styles.greeting}>
              <Text style={{ fontWeight: "bold", color: currentTheme.text }}>
                {greeting}
              </Text>
              <Text style={{ color: currentTheme.accent }}> {userName}!</Text>
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.customButton, showEntregas && styles.activeButton]}
              onPress={() => {
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
                <Text
                  style={[
                    styles.buttonText,
                    { color: showEntregas ? "#fff" : currentTheme.text },
                  ]}
                >
                  Ver Entregas
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.customButton,
                showHistorial && styles.activeButton,
              ]}
              onPress={() => {
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
                <Text
                  style={[
                    styles.buttonText,
                    { color: showHistorial ? "#fff" : currentTheme.text },
                  ]}
                >
                  Ver Historial
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.fragmentContainer,
              { backgroundColor: "transparent" },
            ]}
          >
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
});

export default MainScreen;
