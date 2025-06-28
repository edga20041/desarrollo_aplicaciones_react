// src/services/NotificationService.js
import * as Notifications from "expo-notifications";
import axios from "../axiosInstance";
import * as SecureStore from "expo-secure-store";

const API_BASE = "/novedades";
let notificationInterval = null;
let lastSeenTimestamp = 0;
let consecutiveAuthErrors = 0;
const MAX_AUTH_ERRORS = 3;

export async function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function sendNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

const resetAuthErrorCount = () => {
  consecutiveAuthErrors = 0;
};

export async function startPeriodicNotifications(intervalMinutes = 1) {
  if (notificationInterval) clearInterval(notificationInterval);

  resetAuthErrorCount();

  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.warn("[Notification] No hay token de autenticación");
      return false;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const resInit = await axios.get(`${API_BASE}/ultima`, config);
    lastSeenTimestamp = resInit.data;
    resetAuthErrorCount(); // Reset counter on successful call
  } catch (err) {
    console.warn("[Notification] init timestamp falló", err);
    if (err.response?.status === 403) {
      consecutiveAuthErrors++;
    }
    return false;
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  notificationInterval = setInterval(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        console.warn("[Notification] No hay token de autenticación");
        stopPeriodicNotifications();
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // 1) solicito la última marca
      const { data: serverTs } = await axios.get(`${API_BASE}/ultima`, config);

      // 2) si hay novedades, traigo detalles y notifico
      if (serverTs > lastSeenTimestamp) {
        const { data: nuevos } = await axios.get(
          `${API_BASE}?since=${lastSeenTimestamp}`,
          config
        );
        if (nuevos.length > 0) {
          await sendNotification(
            "¡Tienes nuevos pedidos!",
            `Hay ${nuevos.length} entrega(s) por despachar.`
          );
        }
        lastSeenTimestamp = serverTs;
      }

      // Reset counter on successful call
      resetAuthErrorCount();
    } catch (error) {
      console.error("[Notification] Error en polling:", error);
      if (error.response?.status === 403) {
        consecutiveAuthErrors++;
        console.warn(
          `[Notification] Error de autenticación (${consecutiveAuthErrors}/${MAX_AUTH_ERRORS})`
        );

        // Solo detener el servicio después de varios errores consecutivos
        if (consecutiveAuthErrors >= MAX_AUTH_ERRORS) {
          console.warn(
            "[Notification] Demasiados errores de autenticación, deteniendo servicio"
          );
          stopPeriodicNotifications();
        }
      } else {
        // Reset counter for non-auth errors
        resetAuthErrorCount();
      }
    }
  }, intervalMs);

  return true;
}

export function stopPeriodicNotifications() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    resetAuthErrorCount();
    return true;
  }
  return false;
}

export function isNotificationServiceRunning() {
  return notificationInterval !== null;
}
