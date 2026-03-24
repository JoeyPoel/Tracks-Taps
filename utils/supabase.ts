import { createClient } from "@supabase/supabase-js";
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const rawSupabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

const supabaseUrl = isValidUrl(rawSupabaseUrl) ? rawSupabaseUrl : "https://placeholder.supabase.co";
const supabaseKey = rawSupabaseKey || "placeholder-key";

if (!isValidUrl(rawSupabaseUrl)) {
    console.warn("⚠️ Invalid or missing Supabase URL:", rawSupabaseUrl || "EMPTY");
    console.warn("Using placeholder URL to prevent build crash. Please check your EAS Secrets or .env file.");
} else if (!rawSupabaseKey || rawSupabaseKey === "Use EAS Secret") {
    console.warn("⚠️ Invalid or missing Supabase Key. Using placeholder.");
} else {
    console.log("✅ Supabase initialized with URL:", rawSupabaseUrl);
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