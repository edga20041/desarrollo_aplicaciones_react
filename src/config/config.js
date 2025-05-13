import { Platform } from 'react-native';

// Cambia esta IP por la IP local del backend (de quien lo esté corriendo)
const LOCAL_IP = '192.168.1.74'; // <-- cambiar por la IP del dev o usar env dinámico
const API_PORT = '8081';

const getBaseUrl = () => {
  if (Platform.OS === 'android') return `http://${LOCAL_IP}:${API_PORT}`;
  if (Platform.OS === 'ios') return `http://${LOCAL_IP}:${API_PORT}`;
  if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;
};

const config = {
  API_URL: getBaseUrl(),
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RECOVER: '/auth/recover',
    RESET: '/auth/reset-password',
    VERIFY: '/auth/verify',
    RESEND_CODE: '/auth/resend-code',
    VERIFY_CODE: '/auth/validate-recovery-code',
    RESEND_CODE_RECOVERY: '/auth/resend-recovery-code',
  }
};

export default config;
