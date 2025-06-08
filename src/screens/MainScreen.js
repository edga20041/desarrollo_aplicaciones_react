import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar,
  Platform,
  Animated,
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
  const [scaleAnim] = useState(new Animated.Value(1));
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.greetingContainer}>
                <Text
                  style={[styles.greetingLabel, { color: currentTheme.text }]}
                >
                  {greeting}
                </Text>
                <Text style={[styles.userName, { color: currentTheme.accent }]}>
                  {userName}!
                </Text>
              </View>
              <View style={styles.headerButtons}>
                <Pressable
                  onPress={() => {
                    animatePress();
                    setShowDefaultView(true);
                    setShowEntregas(false);
                    setShowHistorial(false);
                  }}
                  style={({ pressed }) => [
                    styles.headerButton,
                    {
                      backgroundColor: currentTheme.cardBg,
                      borderColor: currentTheme.cardBorder,
                      marginRight: 8,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.headerIconContainer,
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                  >
                    <Icon source="home" size={32} color={currentTheme.text} />
                  </Animated.View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    animatePress();
                    navigation.navigate("ProfileScreen");
                  }}
                  style={({ pressed }) => [
                    styles.headerButton,
                    {
                      backgroundColor: currentTheme.cardBg,
                      borderColor: currentTheme.cardBorder,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.headerIconContainer,
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                  >
                    <Icon
                      source="account-circle-outline"
                      size={32}
                      color={currentTheme.text}
                    />
                  </Animated.View>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.customButton,
                  showEntregas && styles.activeButton,
                ]}
                onPress={() => {
                  animatePress();
                  setShowDefaultView(false);
                  setShowEntregas(true);
                  setShowHistorial(false);
                }}
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
                  <View style={styles.buttonContent}>
                    <Icon
                      source="format-list-bulleted"
                      size={24}
                      color={showEntregas ? "#fff" : currentTheme.text}
                    />
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
                  animatePress();
                  setShowDefaultView(false);
                  setShowEntregas(false);
                  setShowHistorial(true);
                }}
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
                  <View style={styles.buttonContent}>
                    <Icon
                      source="truck-delivery-outline"
                      size={24}
                      color={showHistorial ? "#fff" : currentTheme.text}
                    />
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

            <View style={styles.mainContent}>
              {showDefaultView && (
                <>
                  <View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: currentTheme.text },
                      ]}
                    >
                      Siguiente{" "}
                      <Text
                        style={{
                          color: currentTheme.accent,
                          fontWeight: "bold",
                        }}
                      >
                        entrega
                      </Text>
                    </Text>
                    <EntregasPendientes
                      refresh={refreshEntregas}
                      limitItems={1}
                    />
                    <Pressable
                      onPress={() => {
                        animatePress();
                        setShowDefaultView(false);
                        setShowEntregas(true);
                        setShowHistorial(false);
                      }}
                      style={({ pressed }) => [
                        styles.viewMoreButton,
                        {
                          backgroundColor: pressed
                            ? currentTheme.accent + "10"
                            : "transparent",
                        },
                        { gap: 10, marginTop: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.viewMoreText,
                          { color: currentTheme.accent },
                        ]}
                      >
                        Ver todas las entregas pendientes
                      </Text>
                      <Icon
                        source="arrow-right-circle"
                        size={20}
                        color={currentTheme.accent}
                      />
                    </Pressable>
                  </View>
                </>
              )}
              {showEntregas && <EntregasPendientes refresh={refreshEntregas} />}
              {showHistorial && <HistorialEntregas />}
            </View>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerIconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  customButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeButton: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    alignSelf: "center",
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default MainScreen;
