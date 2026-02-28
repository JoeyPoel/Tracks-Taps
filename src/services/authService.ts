import { supabase } from '@/utils/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
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

    signInWithApple: async () => {
        try {
            const nonce = Crypto.randomUUID();
            const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce,
            });

            if (appleAuthRequestResponse.identityToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'apple',
                    token: appleAuthRequestResponse.identityToken,
                    nonce,
                });

                if (error) {
                    console.error('Error signing in with Apple:', error);
                    throw error;
                }

                if (data) {
                    // Update user metadata with name if available (first login only)
                    if (appleAuthRequestResponse.fullName) {
                        const nameParts = [];
                        if (appleAuthRequestResponse.fullName.givenName) nameParts.push(appleAuthRequestResponse.fullName.givenName);
                        if (appleAuthRequestResponse.fullName.middleName) nameParts.push(appleAuthRequestResponse.fullName.middleName);
                        if (appleAuthRequestResponse.fullName.familyName) nameParts.push(appleAuthRequestResponse.fullName.familyName);

                        const fullName = nameParts.join(' ');

                        await supabase.auth.updateUser({
                            data: {
                                full_name: fullName,
                                given_name: appleAuthRequestResponse.fullName.givenName,
                                family_name: appleAuthRequestResponse.fullName.familyName,
                            }
                        });
                    }
                    return data;
                }
            } else {
                throw new Error('No identityToken received from Apple.');
            }
        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                console.log('Apple Sign-In cancelled by user');
            } else {
                console.error('Apple Sign-In error:', e);
                Alert.alert('Apple Sign-In Error', e.message || 'An unknown error occurred during Apple Sign-In.');
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
