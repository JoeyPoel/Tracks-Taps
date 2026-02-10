import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';

// Lazy load GoogleSignin to avoid crash in Expo Go or dev clients without native module
let GoogleSignin: any;
let statusCodes: any;

try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
    statusCodes = GoogleSigninModule.statusCodes;
} catch {
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
                iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Required for iOS
                offlineAccess: true,
                forceCodeForRefreshToken: true,
            });
        } catch (error) {
            console.warn('Google Signin configure failed (likely missing native module):', error);
        }
    },

    signInWithGoogle: async () => {
        try {
            if (process.env.EXPO_OS === 'android') {
                await GoogleSignin.hasPlayServices();
            }
            const userInfo = await GoogleSignin.signIn();
            console.log("Google Sign-In successful");

            // Depending on the version of @react-native-google-signin/google-signin,
            // idToken might be directly on userInfo or nested.
            const idToken = userInfo.data?.idToken || userInfo.idToken;

            if (idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: idToken,
                });

                if (error) {
                    console.error("Supabase Google Sign-In Error:", error);
                    throw error;
                }

                return data;
            } else {
                console.error("Missing ID Token in response:", userInfo);
                throw new Error('No ID token present in Google Sign-In response!');
            }
        } catch (error: any) {
            if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                console.log('Google Sign-In cancelled by user');
            } else if (error.code === statusCodes?.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
                console.log('Google Sign-In already in progress');
            } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                Alert.alert("Error", "Google Play Services are not available.");
            } else {
                console.error("Google Sign-In logic error:", error);
                Alert.alert("Google Sign-In Error", error.message || "An unknown error occurred during Google Sign-In.");
            }
            return null;
        }
    },

    signOut: async () => {
        try {
            await GoogleSignin.signOut();
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }
};
