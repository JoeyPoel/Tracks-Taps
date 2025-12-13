import { supabase } from '@/utils/supabase';
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

    // hostUri is "IP:PORT"
    const [host, port] = hostUri.split(':');
    return `http://${host}:${port}/api`;
};

// Create an Axios instance with default configuration
const client = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the auth token
client.interceptors.request.use(
    async (config) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        } else {
            console.log('No access token found in session');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally if needed
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here (e.g., logging, redirecting on 401)
        if (error.response?.status === 401) {
            console.log("Unauthorized request:", error.config.url);
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default client;
