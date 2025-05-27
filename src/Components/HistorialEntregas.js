import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "../axiosInstance";
import { useNavigation } from "@react-navigation/native";
import config from "../config/config";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const estadoToString = (estadoId) => {
  if (estadoId === 3) return "Finalizado";
  return estadoId;
};

const HistorialEntregas = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get(config.ENTREGAS.HISTORIAL);
        setHistorial(response.data);
      } catch (error) {
        setHistorial([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  const handleEntregaPress = (entregaId) => {
    navigation.navigate("Detalle Entrega Historial", { entrega_id: entregaId });
  };

  if (loading) {
    return <ActivityIndicator size="large" color={currentTheme.accent} />;
  }

  if (historial.length === 0) {
    return (
      <Text
        style={{ textAlign: "center", marginTop: 20, color: currentTheme.text }}
      >
        No hay historial de entregas.
      </Text>
    );
  }

  return (
    <FlatList
      data={historial}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleEntregaPress(item.id)}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.title, { color: currentTheme.cardText }]}>
              Entrega #{item.id}
            </Text>
            <Text style={{ color: currentTheme.cardText }}>
              Cliente: {item.cliente}
            </Text>
            <Text style={{ color: currentTheme.cardText }}>
              Producto: {item.producto}
            </Text>
            <Text style={{ color: currentTheme.cardText }}>
              Estado: {estadoToString(item.estadoId)}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      style={{ paddingHorizontal: 16 }}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
  },
});

export default HistorialEntregas;
