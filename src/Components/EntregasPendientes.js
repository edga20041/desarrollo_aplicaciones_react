import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import axios from "../axiosInstance";
import { useNavigation } from "@react-navigation/native";
import config from "../config/config";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";
import { Icon } from "react-native-paper";

const EntregasPendientes = ({ refresh, limitItems, userArea }) => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [scaleAnim] = useState(new Animated.Value(1));

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
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

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const response = await axios.get(config.ENTREGAS.PENDIENTES);
        let filteredEntregas = response.data;

        // If userArea is provided and there are deliveries in that area, filter them
        if (
          userArea &&
          response.data.some((entrega) => entrega.area === userArea)
        ) {
          filteredEntregas = response.data.filter(
            (entrega) => entrega.area === userArea
          );
        }

        setEntregas(filteredEntregas);
      } catch (error) {
        setEntregas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEntregas();
  }, [refresh, userArea]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.accent} />
      </View>
    );
  }

  if (entregas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          source="package-variant"
          size={48}
          color={currentTheme.text}
          style={{ opacity: 0.5 }}
        />
        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
          {userArea
            ? "No hay entregas pendientes en tu zona"
            : "No hay entregas pendientes"}
        </Text>
      </View>
    );
  }

  const displayedEntregas = limitItems
    ? entregas.slice(0, limitItems)
    : entregas;

  const handleEntregaPress = (entregaId) => {
    animatePress();
    navigation.navigate("Detalle Entrega Pendiente", { entrega_id: entregaId });
  };

  const handleFinalizarEntrega = (entregaId) => {
    navigation.navigate("FinalizarEntrega", { entrega_id: entregaId });
  };

  const renderEntrega = ({ item }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => handleEntregaPress(item.id)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.idContainer}>
            <Text style={[styles.idLabel, { color: currentTheme.text }]}>
              #{item.id}
            </Text>
          </View>
          <Icon
            source="chevron-right"
            size={24}
            color={currentTheme.text}
            style={{ opacity: 0.5 }}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Icon source="account" size={20} color={currentTheme.accent} />
            <Text style={[styles.infoText, { color: currentTheme.cardText }]}>
              {item.cliente}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              source="package-variant"
              size={20}
              color={currentTheme.accent}
            />
            <Text style={[styles.infoText, { color: currentTheme.cardText }]}>
              {item.producto}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              source="map-marker-radius"
              size={20}
              color={currentTheme.accent}
            />
            <Text style={[styles.infoText, { color: currentTheme.cardText }]}>
              {item.area || "CABA"}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: currentTheme.accent + "20" },
            ]}
          >
            <Icon
              source="clock-outline"
              size={16}
              color={currentTheme.accent}
            />
            <Text style={[styles.statusText, { color: currentTheme.accent }]}>
              Pendiente
            </Text>
          </View>
        </View>
        {item.estadoId === 2 && (
          <Pressable
            style={({ pressed }) => [
              styles.finalizarButton,
              { backgroundColor: pressed ? currentTheme.accent + "CC" : currentTheme.accent },
            ]}
            onPress={() => handleFinalizarEntrega(item.id)}
          >
            <Text style={styles.finalizarButtonText}>Finalizar Entrega</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );

  return (
    <FlatList
      data={displayedEntregas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderEntrega}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  idLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  finalizarButton: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  finalizarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EntregasPendientes;
