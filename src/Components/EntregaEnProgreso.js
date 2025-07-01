import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Linking
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from '../axiosInstance';
import config from "../config/config";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import { Icon } from "react-native-paper";
import { formatDate } from "../utils/dateFormatter";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const openRouteInMaps = (latO, lngO, latD, lngD) => {
  const origin      = `${latO},${lngO}`;
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

const EntregaEnProgreso = ({ refresh, renderHeader }) => {
  const navigation = useNavigation();
  const [entrega, setEntrega] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  useEffect(() => {
    fetchEntregaEnProgreso();
  }, [refresh]);

  const fetchEntregaEnProgreso = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(config.ENTREGAS.EN_PROGRESO);
      setEntrega(response.data);
    } catch (error) {
      console.log("No hay entrega en progreso o error:", error.message);
      setEntrega(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarEntrega = async () => {
    if (entrega) {
      try {
        setEnviandoEmail(true);
        
        Alert.alert(
          "Enviando código",
          "Aguarde mientras se envía el código de finalización a su correo electrónico...",
          [],
          { cancelable: false }
        );
        
        const url = config.API_URL + config.ENTREGAS.CAMBIAR_ESTADO;
        const body = {
          entregaId: entrega.id,
          estadoId: 3, 
          repartidorId: entrega.repartidorId
        };
        
        const axiosWithTimeout = axios.create({
          timeout: 30000, 
        });
        
        const response = await axiosWithTimeout.patch(url, body, {
          headers: {
            'Authorization': `Bearer ${await SecureStore.getItemAsync('token')}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data.status === "Ok") {
          navigation.navigate("VerificarCodigoFinalizacion", {
            entrega_id: entrega.id,
            repartidor_id: entrega.repartidorId,
            cliente: entrega.cliente,
            producto: entrega.producto,
          });
        } else {
          Alert.alert("Error", response.data.message || "Error al enviar el código de finalización");
        }
      } catch (error) {
        console.error("Error al finalizar entrega:", error);
        if (error.code === 'ECONNABORTED') {
          Alert.alert("Error", "Tiempo de espera agotado. Verifique su conexión e intente nuevamente.");
        } else {
          Alert.alert("Error", "No se pudo enviar el código de finalización");
        }
      } finally {
        setEnviandoEmail(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.accent} />
      </View>
    );
  }

  if (!entrega) {
    return renderHeader ? renderHeader(false) : null;
  }

  return (
    <>
      {renderHeader && renderHeader(true)}
      <View style={[styles.container, { backgroundColor: currentTheme.cardBg }]}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <Icon source="truck-delivery" size={24} color={currentTheme.accent} />
            <Text style={[styles.statusText, { color: currentTheme.accent }]}>
              En Progreso
            </Text>
          </View>
          <View style={styles.idContainer}>
            <Text style={[styles.idText, { color: currentTheme.text }]}>
              #{entrega.id}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Icon source="account" size={20} color={currentTheme.accent} />
            <Text style={[styles.infoText, { color: currentTheme.cardText }]}>
              {entrega.cliente}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon source="package-variant" size={20} color={currentTheme.accent} />
            <Text style={[styles.infoText, { color: currentTheme.cardText }]}>
              {entrega.producto}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon source="calendar" size={20} color={currentTheme.accent} />
            <Text style={[styles.infoText, { color: currentTheme.cardText }]}>
              Asignada: {formatDate(entrega.fechaAsignacion)}
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: currentTheme.accent },
            ]}
            onPress={() =>
              navigation.navigate("DetalleEntregaHistorial", {
                entrega_id: entrega.id,
              })
            }
          >
            <Icon
              source="map-marker-outline"
              size={20}
              color="#fff"
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Ver mapa</Text>
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: "#4CAF50" },
            ]}
            onPress={handleFinalizarEntrega}
            disabled={enviandoEmail}
          >
            <Icon
              source="check-circle"
              size={20}
              color="#fff"
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}> Finalizar</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noEntregaContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  noEntregaText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  noEntregaSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  idContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  finalizarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  finalizarButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
actionButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 12,
},
actionButton: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 14,
  borderRadius: 12,
  marginHorizontal: 10,  
},
actionIcon: {
  marginRight: 8,
},
actionText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
},
});

export default EntregaEnProgreso; 