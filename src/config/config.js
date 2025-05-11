import { Platform } from 'react-native';

const API_PORT = '8081';

const config = {
  API_URL: Platform.select({
    web: `http://localhost:${API_PORT}`,
    android: `http://10.0.2.2:${API_PORT}`,
    ios: `http://192.168.0.160:${API_PORT}`,
  }),
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