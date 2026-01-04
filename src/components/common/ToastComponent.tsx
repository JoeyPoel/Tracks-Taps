import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { XMarkIcon } from 'react-native-heroicons/outline';
import Animated, {
    Easing,
    FadeInUp,
    FadeOutUp,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export interface ToastProps {
    visible: boolean;
    title: string;
    message?: string;
    emoji?: string;
    backgroundColor?: string;
    duration?: number;
    onHide: () => void;
}

const { width } = Dimensions.get('window');

export const ToastComponent: React.FC<ToastProps> = ({
    visible,
    title,
    message,
    emoji = '🔔',
    backgroundColor,
    duration = 4000,
    onHide
}) => {
    const insets = useSafeAreaInsets();
    const { theme, mode } = useTheme();

    // Animation Values
    const progress = useSharedValue(1);
    const translateY = useSharedValue(0);

    // Initial Haptic + Timer
    useEffect(() => {
        if (visible) {
            // Haptic Feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Reset animations
            progress.value = 1;
            translateY.value = 0;

            // Start Progress Bar
            progress.value = withTiming(0, { duration, easing: Easing.linear }, (finished) => {
                if (finished) runOnJS(onHide)();
            });
        }
    }, [visible, duration, onHide]);

    // Pan Gesture (Swipe up to dismiss)
    const pan = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY < 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY < -50 || event.velocityY < -500) {
                // Swipe up confirmed - dismiss
                runOnJS(onHide)();
            } else {
                // Return to start
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`
    }));

    if (!visible) return null;

    // Premium Colors
    const isDark = mode === 'dark';
    const accentColor = backgroundColor || theme.primary;

    return (
        <GestureHandlerRootView style={[styles.rootContainer, { top: insets.top + 10 }]} pointerEvents="box-none">
            <GestureDetector gesture={pan}>
                <Animated.View
                    entering={FadeInUp.springify().damping(16).stiffness(150)}
                    exiting={FadeOutUp.duration(300)}
                    style={[styles.wrapper, animatedStyle]}
                >
                    <View style={[styles.shadowContainer, { shadowColor: theme.shadowColor }]}>
                        <View
                            style={[
                                styles.container,
                                {
                                    backgroundColor: theme.bgSecondary,
                                    borderColor: theme.borderPrimary
                                }
                            ]}
                        >
                            {/* Icon / Emoji Section */}
                            <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
                                <Text style={styles.emoji}>{emoji}</Text>
                            </View>

                            {/* Text Content */}
                            <View style={styles.contentContainer}>
                                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{title}</Text>
                                {message && (
                                    <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
                                        {message}
                                    </Text>
                                )}
                            </View>

                            {/* Close Button */}
                            <TouchableOpacity onPress={onHide} hitSlop={10} style={styles.closeButton}>
                                <XMarkIcon size={18} color={theme.textTertiary} />
                            </TouchableOpacity>

                            {/* Progress Bar */}
                            <View style={styles.progressTrack}>
                                <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: accentColor }]} />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 99999, // Super high
    },
    wrapper: {
        width: '92%',
        maxWidth: 400,
    },
    shadowContainer: {
        borderRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingRight: 10,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden', // ensure progress bar stays in bounds
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emoji: {
        fontSize: 22,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
        marginBottom: 2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    message: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    },
    closeButton: {
        padding: 6,
        opacity: 0.7,
    },
    progressTrack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'transparent',
    },
    progressBar: {
        height: '100%',
    }
});
