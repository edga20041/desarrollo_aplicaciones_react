import { Platform } from "react-native";

// Cambia esta IP por la IP local del backend (de quien lo esté corriendo)

const LOCAL_IP = "192.168.1.36";
const API_PORT = "8081";

const getBaseUrl = () => {
  if (Platform.OS === "android") return `http://${LOCAL_IP}:${API_PORT}`;
  if (Platform.OS === "ios") return `http://${LOCAL_IP}:${API_PORT}`;
  if (Platform.OS === "web") return `http://localhost:${API_PORT}`;
};

const config = {
  API_URL: getBaseUrl(),
  GOOGLE_MAPS_API_KEY: "AIzaSyBd8Z79X483e1a33q38bW3a7h227T735nY",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    RECOVER: "/auth/recover",
    RESET: "/auth/reset-password",
    VERIFY: "/auth/verify",
    RESEND_CODE: "/auth/resend-code",
    VERIFY_CODE: "/auth/validate-recovery-code",
    RESEND_CODE_RECOVERY: "/auth/resend-recovery-code",
    PROFILE: "/auth/user/me",
    CHANGE_AREA: "/auth/cambiar-area",
  },
  ENTREGAS: {
    PENDIENTES: "/entregas/pendientes",
    HISTORIAL: "/entregas/historial",
    EN_PROGRESO: "/entregas/en-progreso",
    GET_BY_ID: "/entregas/{entrega_id}",
    CAMBIAR_ESTADO: "/entregas/cambiar_estado",
    VERIFICAR_CODIGO: "/entregas/verificar_codigo",
  },
  ESTADOS: {
    GET_BY_ID: "/estados/{estado_id}",
  },
  RUTAS: {
    GET_BY_ID: "/rutas/{ruta_id}",
  },
  QR: {
    GENERAR_VISTA: "/api/qr/view",
  },
};

export default config;
