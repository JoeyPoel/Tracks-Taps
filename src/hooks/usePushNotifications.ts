import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import client from '@/src/api/apiClient';

// Configure how notifications are presented when the app is in the foreground
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch (e) {
    console.warn('[usePushNotifications] Failed to set notification handler:', e);
}

export function usePushNotifications(userId?: number | null) {
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        registerForPushNotificationsAsync().then(async (token) => {
            if (token) {
                setExpoPushToken(token);
                try {
                    // Send push token to backend
                    await client.post('/user', {
                        action: 'register-push-token',
                        userId,
                        pushToken: token,
                        deviceType: Platform.OS,
                    });
                } catch (error) {
                    console.warn('[usePushNotifications] Failed to register push token with backend:', error);
                }
            }
        }).catch((err) => {
            console.error('[usePushNotifications] registerForPushNotificationsAsync promise rejection:', err);
        });

        // Triggered when a notification is received in the foreground
        try {
            notificationListener.current = Notifications.addNotificationReceivedListener((notificationItem) => {
                setNotification(notificationItem);
            });
        } catch (error) {
            console.warn('[usePushNotifications] Failed to add notification received listener:', error);
        }

        // Triggered when a user taps on a notification (foreground, background, or closed)
        try {
            responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
                const data = response.notification.request.content.data;
                handleNotificationNavigation(data);
            });
        } catch (error) {
            console.warn('[usePushNotifications] Failed to add notification response listener:', error);
        }

        return () => {
            try {
                if (notificationListener.current) {
                    notificationListener.current.remove();
                }
                if (responseListener.current) {
                    responseListener.current.remove();
                }
            } catch (e) {
                // Ignore listener removal errors on clean up
            }
        };
    }, [userId]);

    const handleNotificationNavigation = (data: any) => {
        if (!data) return;

        // Route the user based on the payload screen parameter
        if (data.screen === 'friend-requests') {
            router.push('/(tabs)/profile');
        } else if (data.screen === 'active-tour' && data.tourId) {
            router.push({
                pathname: '/(tabs)/active-tour/[id]',
                params: { id: data.tourId }
            });
        } else if (data.screen === 'game-invite' && data.inviteId) {
            router.push('/(tabs)/join');
        }
    };

    return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    try {
        if (Platform.OS === 'web') {
            return undefined;
        }

        if (!Device.isDevice) {
            console.warn('[usePushNotifications] Must use physical device for Push Notifications');
            return undefined;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync() as any;
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync() as any;
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('[usePushNotifications] Failed to get push token permission!');
            return undefined;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId || '033de2f9-fb8a-489a-8360-f4fb5f48540e';

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return tokenData.data;
    } catch (error) {
        console.error('[usePushNotifications] Error in push notification registration:', error);
        return undefined;
    }
}
