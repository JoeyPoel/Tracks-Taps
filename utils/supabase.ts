import { createClient } from "@supabase/supabase-js";
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase URL or Key is missing! Using placeholders to prevent build crash.");
} else {
    console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log("Supabase Key (first 10 chars):", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + "...");
}
const ExpoStorage = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve(null);
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            return AsyncStorage.getItem(key);
        } catch (e) {
            return Promise.resolve(null);
        }
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            return AsyncStorage.setItem(key, value);
        } catch (e) {
            return Promise.resolve();
        }
    },
    removeItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            return AsyncStorage.removeItem(key);
        } catch (e) {
            return Promise.resolve();
        }
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