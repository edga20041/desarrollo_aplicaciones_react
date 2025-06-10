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
import { formatShortDate } from "../utils/dateFormatter";

const estadoToString = (estadoId) => {
  if (estadoId === 3) return "Finalizado";
  return estadoId;
};

const HistorialEntregas = ({ limitItems, refresh, renderHeader }) => {
  const limit = limitItems || 20;
  const [historial, setHistorial] = useState([]);
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
  }, [refresh]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.accent} />
      </View>
    );
  }

  const handleEntregaPress = (entregaId) => {
    animatePress();
    if (navigation && navigation.canGoBack) {
      navigation.navigate("Detalle Entrega Historial", {
        entrega_id: entregaId,
      });
    } else {
      // If we're in MainScreen, navigate using the parent navigation
      navigation.navigate("Historial");
      setTimeout(() => {
        navigation.navigate("Detalle Entrega Historial", {
          entrega_id: entregaId,
        });
      }, 100);
    }
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
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerContent}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    estadoToString(item.estadoId) === "Finalizado"
                      ? "#4CAF5020"
                      : currentTheme.accent + "20",
                },
              ]}
            >
              <Icon
                source="check-circle-outline"
                size={16}
                color={
                  estadoToString(item.estadoId) === "Finalizado"
                    ? "#4CAF50"
                    : currentTheme.accent
                }
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      estadoToString(item.estadoId) === "Finalizado"
                        ? "#4CAF50"
                        : currentTheme.accent,
                  },
                ]}
              >
                {estadoToString(item.estadoId)}
              </Text>
            </View>

            <View style={styles.dateContainer}>
              <Icon
                source="calendar"
                size={16}
                color={currentTheme.text}
                style={{ opacity: 0.5 }}
              />
              <Text style={[styles.dateText, { color: currentTheme.text }]}>
                {formatShortDate(item.fechaFinalizacion)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderHeader && renderHeader(historial.length > 0)}
      {historial.length > 0 && (
        <>
          <Text
            style={{
              height: 50,
              color: currentTheme.text,
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            {`Hoy completaste ${
              historial.filter((item) => {
                const today = new Date();
                const entregaDate = new Date(item.fechaFinalizacion);
                return today.toDateString() === entregaDate.toDateString();
              }).length
            } entrega${
              historial.filter((item) => {
                const today = new Date();
                const entregaDate = new Date(item.fechaFinalizacion);
                return today.toDateString() === entregaDate.toDateString();
              }).length > 1
                ? "s"
                : ""
            }`}
          </Text>
          <FlatList
            data={historial.slice().reverse().slice(0, limit)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEntrega}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
      {!loading && historial.length === 0 && !renderHeader && (
        <View style={styles.emptyContainer}>
          <Icon
            source="history"
            size={48}
            color={currentTheme.text}
            style={{ opacity: 0.5 }}
          />
          <Text style={[styles.emptyText, { color: currentTheme.text }]}>
            No hay historial de entregas
          </Text>
        </View>
      )}
    </View>
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
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.7,
  },
});

export default HistorialEntregas;
