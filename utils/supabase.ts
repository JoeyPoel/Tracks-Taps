import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from "@supabase/supabase-js";
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL or Key is missing! Please check your .env file.");
}

// Custom storage adapter to handle SSR/Node environments where AsyncStorage might fail or window is undefined
const ExpoStorage = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve(null);
        return AsyncStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        return AsyncStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        return AsyncStorage.removeItem(key);
    },
};

export const supabase = createClient(supabaseUrl || "", supabaseKey || "", {
    auth: {
        storage: ExpoStorage,
        autoRefreshToken: true,
        persistSession: true, // Only persists on client where storage works
        detectSessionInUrl: false,
    },
});

// AppState is React Native specific. Ensure we don't crash in Node/API routes.
if (typeof window !== 'undefined' && AppState) {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh();
        } else {
            supabase.auth.stopAutoRefresh();
        }
    });
}