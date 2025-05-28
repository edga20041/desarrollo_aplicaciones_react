import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  Button,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "../axiosInstance";
import config from "../config/config";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const DetalleEntregaPendiente = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { entrega_id } = route.params;
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const url =
          config.API_URL +
          config.ENTREGAS.GET_BY_ID.replace("{entrega_id}", entrega_id);
        const response = await axios.get(url);
        setDetalle(response.data);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el detalle de la entrega.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [entrega_id]);

  const finalizarEntrega = async () => {
    setFinalizando(true);
    setShowImage(true);

    setTimeout(async () => {
      setShowImage(false);
      try {
        const token = await SecureStore.getItemAsync("token");
        const url = config.API_URL + config.ENTREGAS.CAMBIAR_ESTADO;
        const body = {
          entregaId: detalle.id,
          estadoId: 3,
          repartidorId: detalle.repartidorId,
        };
        await axios.patch(url, body, {});
        Alert.alert("Éxito", "La entrega fue finalizada.");
        navigation.goBack();
      } catch (error) {
        Alert.alert("Error", "No se pudo finalizar la entrega.");
      } finally {
        setFinalizando(false);
      }
    }, 7000);
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
          style={[{ flex: 1 }, { backgroundColor: currentTheme.primary }]}
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

  if (!detalle) {
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
          style={[{ flex: 1 }, { backgroundColor: currentTheme.primary }]}
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
            <Text style={{ color: currentTheme.text, fontSize: 18 }}>
              No se encontró la entrega.
            </Text>
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
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView
        style={[{ flex: 1 }, { backgroundColor: currentTheme.primary }]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
          translucent
        />

        {showImage ? (
          <Image
            source={require("../../assets/qr_imagen.jpeg")}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.container, { backgroundColor: "transparent" }]}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>
              Detalle de Entrega Pendiente
            </Text>
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
                Cliente:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalle.cliente}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                DNI:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalle.clienteDni}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Producto:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalle.producto}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Ruta ID:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalle.rutaId}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Estado:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  Pendiente
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Fecha Creación:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalle.fechaCreacion}
                </Text>
              </Text>
            </View>
            <Pressable
              style={[
                styles.qrButton,
                {
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.accent,
                },
              ]}
              onPress={finalizarEntrega}
              disabled={finalizando}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.qrButtonText, { color: currentTheme.accent }]}
              >
                {finalizando ? "Finalizando..." : "QR"}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.backButton,
                {
                  backgroundColor: currentTheme.accent,
                },
              ]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </Pressable>
          </View>
        )}
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
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  value: {
    fontWeight: "normal",
  },
  qrButton: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrButtonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  backButton: {
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  fullscreenImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 1000,
  },
});

export default DetalleEntregaPendiente;
