// src/services/NotificationService.js
import * as Notifications from "expo-notifications";
import axios from "../axiosInstance";

const API_BASE = "/novedades";
let notificationInterval = null;
let lastSeenTimestamp = 0;

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

export async function startPeriodicNotifications(intervalMinutes = 1) {
  if (notificationInterval) clearInterval(notificationInterval);

  try {
    const resInit = await axios.get(`${API_BASE}/ultima`);
    lastSeenTimestamp = resInit.data;
  } catch (err) {
    console.warn("[Notification] init timestamp falló", err);
  }

  //Se debe estructurar una API en el backend, consultado si hay pediddos nuevos y que end point si da true dispare notificacion y si da false no haga nada
  const intervalMs = intervalMinutes * 60 * 1000;
  notificationInterval = setInterval(async () => {
    try {
      // 1) solicito la última marca
      const { data: serverTs } = await axios.get(`${API_BASE}/ultima`);

      // 2) si hay novedades, traigo detalles y notifico
      if (serverTs > lastSeenTimestamp) {
        const { data: nuevos } = await axios.get(
          `${API_BASE}?since=${lastSeenTimestamp}`
        );
        if (nuevos.length > 0) {
          await sendNotification(
            "¡Tienes nuevos pedidos!",
            `Hay ${nuevos.length} entrega(s) por despachar.`
          );
        }
        lastSeenTimestamp = serverTs;
      }
    } catch (error) {
      console.error("[Notification] Error en polling:", error);
    }
  }, intervalMs);

  return true;
}

export function stopPeriodicNotifications() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    return true;
  }
  return false;
}

export function isNotificationServiceRunning() {
  return notificationInterval !== null;
}
