import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import axios from "../axiosInstance";
import { useNavigation } from "@react-navigation/native";
import config from "../config/config";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const EntregasPendientes = ({ refresh }) => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const response = await axios.get(config.ENTREGAS.PENDIENTES);
        setEntregas(response.data);
      } catch (error) {
        setEntregas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEntregas();
  }, [refresh]);

  if (loading) {
    return <ActivityIndicator size="large" color={currentTheme.accent} />;
  }

  if (entregas.length === 0) {
    return (
      <Text
        style={{
          textAlign: "center",
          marginTop: 20,
          color: currentTheme.text,
          fontSize: 16,
        }}
      >
        No hay entregas pendientes.
      </Text>
    );
  }

  const handleEntregaPress = (entregaId) => {
    navigation.navigate("Detalle Entrega Pendiente", { entrega_id: entregaId });
  };

  return (
    <FlatList
      data={entregas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handleEntregaPress(item.id)}
          activeOpacity={0.7}
        >
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
            <Text style={[styles.text, { color: currentTheme.cardText }]}>
              Cliente: {item.cliente}
            </Text>
            <Text style={[styles.text, { color: currentTheme.cardText }]}>
              Producto: {item.producto}
            </Text>
          </View>
        </Pressable>
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
    marginBottom: 8,
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default EntregasPendientes;
