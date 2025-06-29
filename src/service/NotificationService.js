// src/services/NotificationService.js

import * as Notifications from "expo-notifications";
import axios from "../axiosInstance";
import * as SecureStore from "expo-secure-store";

const API_COUNT = "/novedades/count";
let notificationInterval = null;

/**
 * Configura cómo se muestran las notificaciones locales.
 */
export async function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Pide permiso al usuario para recibir notificaciones.
 * Devuelve true solo si acepta.
 */
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Envía inmediatamente una notificación local.
 */
async function sendNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

/**
 * Arranca el polling cada `intervalMinutes` minutos.
 * Solo comienza si hay un token válido en SecureStore.
 */
export async function startPeriodicNotifications(intervalMinutes = 1) {
  // 1) Si ya está corriendo, lo detenemos
  if (notificationInterval) clearInterval(notificationInterval);

  // 2) Recuperamos token; si no existe, no arrancamos
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    console.warn("[Notification] Usuario no autenticado, no arranco polling");
    return false;
  }
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // 3) Función que consulta el contador y dispara notificación si >0
  const checkForUpdates = async () => {
    try {
      const { data: count } = await axios.get(API_COUNT, config);
      if (count > 0) {
        await sendNotification(
          "¡Nuevos pedidos!",
          `Aparecieron ${count} pedido(s).`
        );
        console.log(`[Notification] Disparada por ${count} pedido(s)`);
      }
    } catch (err) {
      console.error("[Notification] Error en polling:", err);
      // Si obtuviste 401/403 podrías detener aquí:
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn("[Notification] Token inválido, detengo polling");
        stopPeriodicNotifications();
      }
    }
  };

  // 4) Hacemos un primer chequeo inmediato y luego programamos el intervalo
  await checkForUpdates();
  notificationInterval = setInterval(
    checkForUpdates,
    intervalMinutes * 60 * 1000
  );

  console.log(`[Notification] Polling iniciado cada ${intervalMinutes} min`);
  return true;
}

/**
 * Detiene el polling y limpia el intervalo.
 */
export function stopPeriodicNotifications() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log("[Notification] Polling detenido");
    return true;
  }
  return false;
}

/**
 * Devuelve true si el servicio de polling está activo.
 */
export function isNotificationServiceRunning() {
  return notificationInterval !== null;
}
