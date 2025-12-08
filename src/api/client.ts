import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return '/api';

    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri) {
        // Fallback for production or if hostUri is missing
        return 'http://localhost:8081/api';
    }

    const part = hostUri.split(':')[0];
    return `http://${part}:8081/api`;
};

// Create an Axios instance with default configuration
const client = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor to handle errors globally if needed
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here (e.g., logging, redirecting on 401)
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default client;
