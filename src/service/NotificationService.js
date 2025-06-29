import * as Notifications from "expo-notifications";
import axios from "../axiosInstance";
import * as SecureStore from "expo-secure-store";

const API_COUNT = "/notificaciones/count";
let notificationInterval = null;

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

async function sendNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

export async function startPeriodicNotifications(intervalMinutes = 1) {
  if (notificationInterval) clearInterval(notificationInterval);

  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    console.warn("[Notification] Usuario no autenticado, no arranco polling");
    return false;
  }
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const checkForUpdates = async () => {
    try {
      const { data: count } = await axios.get(API_COUNT, config);
      console.log("[Notification] Count recibido:", count);
      if (count > 0) {
        await sendNotification(
          "¡NUEVOS PEDIDOS DISPONIBLES!",
          `Aparecieron ${count} pedidos nuevos, revisa 'Ver Entregas' para completar uno de ellos.`
        );
        console.log(`[Notification] Disparada por ${count} pedido(s)`);
      }
    } catch (err) {
      console.error("[Notification] Error en polling:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn("[Notification] Token inválido, detengo polling");
        stopPeriodicNotifications();
      }
    }
  };

  await checkForUpdates();
  notificationInterval = setInterval(
    checkForUpdates,
    intervalMinutes * 60 * 1000
  );

  console.log(`[Notification] Polling iniciado cada ${intervalMinutes} min`);
  return true;
}

export function stopPeriodicNotifications() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log("[Notification] Polling detenido");
    return true;
  }
  return false;
}

export function isNotificationServiceRunning() {
  return notificationInterval !== null;
}
