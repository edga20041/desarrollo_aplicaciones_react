import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  Platform,
  Linking,
  LogBox
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import config from "../config/config";
import axiosInstance from "../axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import { formatDate } from "../utils/dateFormatter";
LogBox.ignoreLogs([/Error from the server/]);

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

  // Función para abrir ruta en Google Maps / Apple Maps
  const openRouteInMaps = (latO, lngO, latD, lngD) => {
    const origin = `${latO},${lngO}`;
    const destination = `${latD},${lngD}`;

    const iosURL     = `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`;
    const androidURL = `google.navigation:q=${destination}&mode=d`;
    const webURL     = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    const url        = Platform.OS === "ios" ? iosURL : androidURL;

    Linking.canOpenURL(url)
      .then(supported =>
        supported ? Linking.openURL(url) : Linking.openURL(webURL)
      )
      .catch(err => console.error("Error al abrir rutas en Maps:", err));
  };

  useEffect(() => {
    if (entrega_id) cargarDetalleEntrega(entrega_id);
    else {
      Alert.alert("Error", "ID de entrega no encontrado");
      navigation.goBack();
    }
  }, [entrega_id, navigation]);

  const cargarDetalleEntrega = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const url = config.API_URL + config.ENTREGAS.GET_BY_ID.replace("{entrega_id}", id);
      const res = await axiosInstance.get(url);
      if (res.status === 200 && res.data) {
        setDetalleEntrega(res.data);
        cargarNombreEstado(res.data.estadoId);
        cargarDetalleRuta(res.data.rutaId);
      } else {
        throw new Error(res.status);
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar datos de la entrega.");
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleRuta = async (rutaId) => {
    try {
      const url = config.API_URL + config.RUTAS.GET_BY_ID.replace("{ruta_id}", rutaId);
      const res = await axiosInstance.get(url);
      if (res.status === 200) setDetalleRuta(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarNombreEstado = async (estadoId) => {
    try {
      const url = config.API_URL + config.ESTADOS.GET_BY_ID.replace("{estado_id}", estadoId);
      const res = await axiosInstance.get(url);
      if (res.status === 200) setEstadoNombre(res.data.nombre);
    } catch (e) {
      console.error(e);
    }
  };

  const configurarMapa = async () => {
    if (!detalleRuta || !mapReady) return;
    try {
      const ori = await Geocoder.from(detalleRuta.latitudOrigen, detalleRuta.longitudOrigen);
      if (ori.results.length) setOrigenAddress(ori.results[0].formatted_address);
      const des = await Geocoder.from(detalleRuta.latitudDestino, detalleRuta.longitudDestino);
      if (des.results.length) setDestinoAddress(des.results[0].formatted_address);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { configurarMapa(); }, [detalleRuta, mapReady]);

  const onMapReadyHandler = () => setMapReady(true);
  const handleVolver = () => navigation.goBack();

  if (loading) return (
    <LinearGradient colors={isDarkMode ? ["#1A1A2E","#16213E","#0F3460"] : ["#FFFFFF","#F5F5F5","#E8E8E8"]} style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={currentTheme.accent} />
    </LinearGradient>
  );

  if (error || !detalleEntrega) return (
    <LinearGradient colors={isDarkMode ? ["#1A1A2E","#16213E","#0F3460"] : ["#FFFFFF","#F5F5F5","#E8E8E8"]} style={styles.loaderContainer}>
      <Text style={[styles.errorText, { color: currentTheme.text }]}>{error || "No se encontró la entrega."}</Text>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={isDarkMode ? ["#1A1A2E","#16213E","#0F3460"] : ["#FFFFFF","#F5F5F5","#E8E8E8"]} style={styles.gradient}>
      <SafeAreaView style={styles.flex} edges={["right","left","bottom"]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={currentTheme.primary} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Text style={[styles.title, { color: currentTheme.accent }]}>Detalle de Entrega Finalizada</Text>
            <View style={[styles.card, { backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }]}>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Cliente: <Text style={[styles.value, { color: currentTheme.cardText }]}>{detalleEntrega.cliente}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>DNI: <Text style={[styles.value, { color: currentTheme.cardText }]}>{detalleEntrega.clienteDni}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Producto: <Text style={[styles.value, { color: currentTheme.cardText }]}>{detalleEntrega.producto}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Ruta ID: <Text style={[styles.value, { color: currentTheme.cardText }]}>{detalleEntrega.rutaId}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Estado: <Text style={[styles.value, { color: currentTheme.cardText }]}>{estadoNombre}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Fecha Creación: <Text style={[styles.value, { color: currentTheme.cardText }]}>{formatDate(detalleEntrega.fechaCreacion)}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Fecha Finalización: <Text style={[styles.value, { color: currentTheme.cardText }]}>{formatDate(detalleEntrega.fechaFinalizacion)}</Text></Text>
              <Text style={[styles.label, { color: currentTheme.cardText }]}>Zona: <Text style={[styles.value, { color: currentTheme.cardText }]}>{detalleEntrega.area || "CABA"}</Text></Text>

              {/* Enlace de texto para abrir mapa */}
              {detalleRuta && (
                <Text
                  style={[styles.linkText, { color: currentTheme.accent }]}
                  onPress={() => openRouteInMaps(
                    detalleRuta.latitudOrigen,
                    detalleRuta.longitudOrigen,
                    detalleRuta.latitudDestino,
                    detalleRuta.longitudDestino
                  )}
                >
                  Ver mapa
                </Text>
              )}
            </View>

            <Text style={[styles.mapTitle, { color: currentTheme.accent }]}>Ubicación de la Ruta</Text>
            {detalleRuta && (
              <View style={[styles.mapContainer, { backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }]}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: (detalleRuta.latitudOrigen + detalleRuta.latitudDestino) / 2,
                    longitude: (detalleRuta.longitudOrigen + detalleRuta.longitudDestino) / 2,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onMapReady={onMapReadyHandler}
                >
                  <Marker coordinate={{ latitude: detalleRuta.latitudOrigen, longitude: detalleRuta.longitudOrigen }} title="Origen" />
                  <Marker coordinate={{ latitude: detalleRuta.latitudDestino, longitude: detalleRuta.longitudDestino }} title="Destino" />
                  <Polyline coordinates={[{ latitude: detalleRuta.latitudOrigen, longitude: detalleRuta.longitudOrigen }, { latitude: detalleRuta.latitudDestino, longitude: detalleRuta.longitudDestino }]} strokeColor={currentTheme.accent} strokeWidth={2} />
                </MapView>
                {origenAddress ? <Text style={[styles.addressText, { color: currentTheme.cardText }]}>{origenAddress}</Text> : null}
                {destinoAddress ? <Text style={[styles.addressText, { color: currentTheme.cardText }]}>{destinoAddress}</Text> : null}
              </View>
            )}

            <TouchableOpacity style={[styles.volverButton, { backgroundColor: currentTheme.accent }]} onPress={handleVolver}>
              <Text style={styles.volverButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 14, textAlign: "center" },
  card: { borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  label: { fontSize: 16, marginBottom: 6, fontWeight: "500" },
  value: { fontWeight: "normal" },
  linkText: { fontSize: 16, fontWeight: "600", textDecorationLine: "underline" },
  mapTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  mapContainer: { borderRadius: 12, overflow: "hidden", borderWidth: 1, padding: 8, marginBottom: 20 },
  map: { height: 250, width: "100%", borderRadius: 8 },
  addressText: { marginTop: 8, fontSize: 14, paddingHorizontal: 8 },
  volverButton: { marginTop: 0, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  volverButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
});

export default DetalleEntregaHistorial;
