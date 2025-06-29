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
        if (error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
            originalRequest._retry = true; 
            await SecureStore.deleteItemAsync('token'); 
            await AsyncStorage.removeItem('userName'); 

            const currentRoute = navigationRef.getCurrentRoute && navigationRef.getCurrentRoute();
            if (currentRoute && currentRoute.name === 'Login') {
                return Promise.reject(error);
            }

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
