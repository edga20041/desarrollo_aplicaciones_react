import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; 
import config from './config/config'; 
import {navigationRef} from './Components/NavigationService';

const instance = axios.create({
    baseURL: config.API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    async (configReq) => {
        const token = await SecureStore.getItemAsync('token'); 
        console.log('🔑 Token en request:', token ? 'Presente' : 'Ausente');
        if (token) {
            configReq.headers.Authorization = `Bearer ${token}`;
            console.log('📤 Enviando request con token a:', configReq.url);
        } else {
            console.log('⚠️ No hay token disponible para:', configReq.url);
        }
        return configReq;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('❌ Error en respuesta:', error.response?.status, error.response?.statusText);
        console.log('🔗 URL que falló:', originalRequest.url);
        
        if (error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
            originalRequest._retry = true; 
            
            console.log('🚫 Token expirado o no autorizado. Limpiando datos...');
            await SecureStore.deleteItemAsync('token'); 
            await AsyncStorage.removeItem('userName'); 
            
            console.error('Token expirado o no autorizado. Redirigir a la pantalla de login.');

            if (navigationRef.isReady()) {
                navigationRef.reset({
                index: 0,
                routes: [{ name: 'Login' }],
                });
            }
        }
        return Promise.reject(error);
    }
);

export default instance; 
