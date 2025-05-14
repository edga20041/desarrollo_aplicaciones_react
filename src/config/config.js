import { Platform } from 'react-native';
import { LOCAL_IP, API_PORT } from '@env';

const getBaseUrl = () => {
  const base = `http://${LOCAL_IP}:${API_PORT}`;
  if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;
  if (Platform.OS === 'android') return `http://${LOCAL_IP}:${API_PORT}`;
  if (Platform.OS === 'ios') return `http://${LOCAL_IP}:${API_PORT}`;
  return base;
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
