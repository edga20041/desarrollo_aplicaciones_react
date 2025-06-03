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
        if (token) {
            configReq.headers.Authorization = `Bearer ${token}`;
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
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 
            
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
