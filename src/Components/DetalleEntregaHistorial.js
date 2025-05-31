import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView} from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import config from "../config/config";
import axiosInstance from "../axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const DetalleEntregaHistorial = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { entrega_id } = route.params;
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  const [detalleEntrega, setDetalleEntrega] = useState(null);
  const [detalleRuta, setDetalleRuta] = useState(null);
  const [estadoNombre, setEstadoNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [origenAddress, setOrigenAddress] = useState("");
  const [destinoAddress, setDestinoAddress] = useState("");

  useEffect(() => {
    if (entrega_id) {
      cargarDetalleEntrega(entrega_id);
    } else {
      Alert.alert("Error", "ID de entrega no encontrado");
      navigation.goBack();
    }
  }, [entrega_id, navigation]);

  const cargarDetalleEntrega = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Cargando detalle de entrega con ID:", id);
      const token = await SecureStore.getItemAsync("token");
      console.log("Token enviado:", token);
      const url =
        config.API_URL + config.ENTREGAS.GET_BY_ID.replace("{entrega_id}", id);
      console.log("URL de la petición de detalle de entrega:", url);
      const responseEntrega = await axiosInstance.get(url);
      console.log("Respuesta de detalle de entrega:", responseEntrega);
      if (responseEntrega.status === 200 && responseEntrega.data) {
        setDetalleEntrega(responseEntrega.data);
        cargarNombreEstado(responseEntrega.data.estadoId);
        cargarDetalleRuta(responseEntrega.data.rutaId);
      } else {
        const errorMessage = `Error al cargar detalle de entrega. Status: ${responseEntrega.status}`;
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error al cargar detalle de entrega:", error);
      setError(`Error de conexión al cargar detalle: ${error.message}`);
      Alert.alert(
        "Error",
        `Error de conexión al cargar detalle: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleRuta = async (rutaId) => {
    setError(null);
    try {
      console.log("Cargando detalle de ruta con ID:", rutaId);
      const url =
        config.API_URL + config.RUTAS.GET_BY_ID.replace("{ruta_id}", rutaId);
      console.log("URL de la petición de detalle de ruta:", url);
      const responseRuta = await axiosInstance.get(url);
      console.log("Respuesta de detalle de ruta:", responseRuta);
      if (responseRuta.status === 200 && responseRuta.data) {
        setDetalleRuta(responseRuta.data);
      } else {
        const errorMessage = `Error al cargar detalle de la ruta. Status: ${responseRuta.status}`;
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error al cargar detalle de la ruta:", error);
      setError(
        `Error de conexión al cargar detalle de la ruta: ${error.message}`
      );
      Alert.alert(
        "Error",
        `Error de conexión al cargar detalle de la ruta: ${error.message}`
      );
    }
  };

  const cargarNombreEstado = async (estadoId) => {
    setError(null);
    try {
      console.log("Cargando nombre de estado con ID:", estadoId);
      const url =
        config.API_URL +
        config.ESTADOS.GET_BY_ID.replace("{estado_id}", estadoId);
      console.log("URL de la petición de estado:", url);
      const responseEstado = await axiosInstance.get(url);
      console.log("Respuesta de estado:", responseEstado);
      if (responseEstado.status === 200 && responseEstado.data) {
        setEstadoNombre(responseEstado.data.nombre);
      } else {
        setEstadoNombre(
          `Estado ID: ${estadoId} (Error al cargar nombre. Status: ${responseEstado.status})`
        );
      }
    } catch (error) {
      console.error("Error al cargar nombre de estado:", error);
      setEstadoNombre(
        `Estado ID: ${estadoId} (Error de conexión: ${error.message})`
      );
    }
  };

  const configurarMapa = async () => {
    if (detalleRuta && mapReady) {
      const origen = {
        latitude: detalleRuta.latitudOrigen,
        longitude: detalleRuta.longitudOrigen,
      };
      const destino = {
        latitude: detalleRuta.latitudDestino,
        longitude: detalleRuta.longitudDestino,
      };

      try {
        const origenResult = await Geocoder.from(
          origen.latitude,
          origen.longitude
        );
        if (origenResult.results.length > 0) {
          setOrigenAddress(
            `Origen: ${origenResult.results[0].formatted_address}`
          );
        }

        const destinoResult = await Geocoder.from(
          destino.latitude,
          destino.longitude
        );
        if (destinoResult.results.length > 0) {
          setDestinoAddress(
            `Destino: ${destinoResult.results[0].formatted_address}`
          );
        }
      } catch (error) {}
    }
  };

  const onMapReadyHandler = () => {
    setMapReady(true);
  };

  useEffect(() => {
    configurarMapa();
  }, [detalleRuta, mapReady]);

  const handleVolver = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1A1A2E", "#16213E", "#0F3460"]
            : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
        }
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={currentTheme.accent} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1A1A2E", "#16213E", "#0F3460"]
            : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
        }
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: currentTheme.text, fontSize: 18 }}>{error}</Text>
      </LinearGradient>
    );
  }

  if (!detalleEntrega) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1A1A2E", "#16213E", "#0F3460"]
            : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
        }
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: currentTheme.text, fontSize: 18 }}>
          No se encontraron detalles de la entrega.
        </Text>
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
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'left', 'bottom']}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
          translucent
        />
        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              Detalle de Entrega
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
                  {detalleEntrega.cliente}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                DNI:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalleEntrega.clienteDni}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Producto:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalleEntrega.producto}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Ruta ID:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalleEntrega.rutaId}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Estado:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {estadoNombre}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Fecha Creación:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalleEntrega.fechaCreacion}
                </Text>
              </Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>
                Fecha Finalización:{" "}
                <Text style={[styles.value, { color: currentTheme.cardText }]}>
                  {detalleEntrega.fechaFinalizacion}
                </Text>
              </Text>
            </View>
            <Text style={[styles.mapTitle, { color: currentTheme.text }]}>
              Ubicación de la Ruta
            </Text>
            {detalleRuta && (
              <View
                style={[
                  styles.mapContainer,
                  {
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.cardBorder,
                  },
                ]}
              >
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude:
                      (detalleRuta.latitudOrigen + detalleRuta.latitudDestino) /
                      2,
                    longitude:
                      (detalleRuta.longitudOrigen +
                        detalleRuta.longitudDestino) /
                      2,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onMapReady={onMapReadyHandler}
                >
                  <Marker
                    coordinate={{
                      latitude: detalleRuta.latitudOrigen,
                      longitude: detalleRuta.longitudOrigen,
                    }}
                    title="Origen"
                  />
                  <Marker
                    coordinate={{
                      latitude: detalleRuta.latitudDestino,
                      longitude: detalleRuta.longitudDestino,
                    }}
                    title="Destino"
                  />
                  <Polyline
                    coordinates={[
                      {
                        latitude: detalleRuta.latitudOrigen,
                        longitude: detalleRuta.longitudOrigen,
                      },
                      {
                        latitude: detalleRuta.latitudDestino,
                        longitude: detalleRuta.longitudDestino,
                      },
                    ]}
                    strokeColor={currentTheme.accent}
                    strokeWidth={2}
                  />
                </MapView>
                {origenAddress && (
                  <Text
                    style={[
                      styles.addressText,
                      { color: currentTheme.cardText },
                    ]}
                  >
                    {origenAddress}
                  </Text>
                )}
                {destinoAddress && (
                  <Text
                    style={[
                      styles.addressText,
                      { color: currentTheme.cardText },
                    ]}
                  >
                    {destinoAddress}
                  </Text>
                )}
              </View>
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
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  value: {
    fontWeight: "normal",
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    padding: 8,
  },
  map: {
    height: 300,
    width: "100%",
    borderRadius: 8,
  },
  addressText: {
    marginTop: 8,
    fontSize: 14,
    paddingHorizontal: 8,
  },
});

export default DetalleEntregaHistorial;
