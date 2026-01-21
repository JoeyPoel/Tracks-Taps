import { supabase } from '@/utils/supabase';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return '/api';

    // Prioritize environment variable for production/beta
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri) {
        // Fallback for production or if hostUri is missing
        // For Android Emulator, use 10.0.2.2
        if (Platform.OS === 'android') {
            console.log('API Client: hostUri missing, falling back to 10.0.2.2 for Android');
            return 'http://10.0.2.2:8081/api';
        }
        return 'http://localhost:8081/api';
    }

    // hostUri is "IP:PORT"
    const [host, port] = hostUri.split(':');
    const url = `http://${host}:${port}/api`;
    console.log('API Client Base URL:', url);
    return url;
};

// Create an Axios instance with default configuration
const client = axios.create({
    baseURL: getBaseUrl(),
    timeout: 30000,
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
            // Verify if we are not already on an auth screen to avoid loops or unnecessary modals
            // But usually the modal handles its own visibility state
            const { authEvents } = require('@/src/utils/authEvents');
            authEvents.emit();

            // Force redirect to login
            router.replace('/auth/login');
        }

        if (error.response?.status >= 500) {
            router.replace({
                pathname: '/error-screen',
                params: {
                    title: 'Server Error',
                    message: typeof error.response?.data?.message === 'string'
                        ? error.response.data.message
                        : "Our servers are having a moment. Please try again later."
                }
            });
        }

        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default client;
