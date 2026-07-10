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
        let { data: { session } } = await supabase.auth.getSession();

        if (session) {
            const expiresAt = session.expires_at;
            const now = Math.floor(Date.now() / 1000);
            // Proactively refresh if token expires in less than 60 seconds
            if (expiresAt && (expiresAt - now < 60)) {
                console.log('Session token is expiring soon, proactively refreshing...');
                const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
                if (!error && refreshedSession) {
                    session = refreshedSession;
                }
            }
        }

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
    async (error) => {
        const originalRequest = error.config;

        // If unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("Unauthorized request, attempting token refresh for:", originalRequest.url);

            try {
                const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
                if (!refreshError && session?.access_token) {
                    console.log("Token refreshed successfully, retrying request...");
                    originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
                    return client(originalRequest);
                }
            } catch (refreshCatchError) {
                console.error("Token refresh failed:", refreshCatchError);
            }
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
