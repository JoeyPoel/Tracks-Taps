import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback types for different interactions.
 */
export type HapticType =
    | 'light'    // Subtle, for standard taps
    | 'medium'   // Distinct, for secondary actions
    | 'heavy'    // Strong, for significant events
    | 'success'  // Success notification
    | 'warning'  // Warning notification
    | 'error'    // Error/Failure notification
    | 'selection'; // Picker/Scroll selection

/**
 * Triggers a haptic feedback response.
 * Uses expo-haptics and handles platform differences if necessary.
 *
 * @param type - The type of haptic feedback to trigger.
 */
export const triggerHaptic = (type: HapticType = 'light') => {
    if (Platform.OS === 'web') return; // Haptics not supported on web

    switch (type) {
        case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
        case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
        case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
        case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        case 'selection':
            Haptics.selectionAsync();
            break;
        default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
};
