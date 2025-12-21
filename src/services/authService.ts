import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';

// Lazy load GoogleSignin to avoid crash in Expo Go or dev clients without native module
let GoogleSignin: any;
let statusCodes: any;

try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
    statusCodes = GoogleSigninModule.statusCodes;
} catch (e) {
    console.warn('GoogleSignin module not found. This is expected in Expo Go.');
    // Mocking to prevent crash on access, but functionality will fail/alert
    GoogleSignin = {
        configure: () => { },
        hasPlayServices: async () => { },
        signIn: async () => { throw new Error('Google Sign-In not available in Expo Go. Please use a development build.'); },
        signOut: async () => { },
    };
    statusCodes = {
        SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
        IN_PROGRESS: 'IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    };
}

export const AuthService = {
    configureGoogle: () => {
        try {
            GoogleSignin.configure({
                scopes: ['email', 'profile'],
                webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            });
        } catch (error) {
            console.warn('Google Signin configure failed (likely missing native module):', error);
        }
    },

    signInWithGoogle: async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data.idToken,
                });

                if (error) {
                    throw error;
                }

                return data;
            } else {
                throw new Error('No ID token present!');
            }
        } catch (error: any) {
            if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes?.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                Alert.alert("Error", "Google Play Services are not available.");
            } else {
                console.error(error);
                Alert.alert("Google Sign-In Error", error.message);
            }
            return null;
        }
    },

    signOut: async () => {
        try {
            await GoogleSignin.signOut();
            await supabase.auth.signOut();
        } catch (error) {
            console.error(error);
        }
    }
};
