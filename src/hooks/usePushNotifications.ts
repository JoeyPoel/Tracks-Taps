import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import client from '@/src/api/apiClient';

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

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
        });

        // Triggered when a notification is received in the foreground
        notificationListener.current = Notifications.addNotificationReceivedListener((notificationItem) => {
            setNotification(notificationItem);
        });

        // Triggered when a user taps on a notification (foreground, background, or closed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            handleNotificationNavigation(data);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
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

    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '033de2f9-fb8a-489a-8360-f4fb5f48540e', // Tracks and Taps Project ID
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
}
