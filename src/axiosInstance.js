import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config/config';

const instance = axios.create({
  baseURL: config.API_URL,
});

instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
