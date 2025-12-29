import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ToastProps {
    visible: boolean;
    title: string;
    message?: string;
    emoji?: string;
    backgroundColor?: string;
    duration?: number;
    onHide: () => void;
}

export const ToastComponent: React.FC<ToastProps> = ({
    visible,
    title,
    message,
    emoji = '🏆',
    backgroundColor = '#4CAF50',
    duration = 3000,
    onHide
}) => {
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onHide();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOutUp}
            style={[
                styles.container,
                {
                    top: insets.top + 10,
                    backgroundColor: backgroundColor
                }
            ]}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{title}</Text>
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        zIndex: 9999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emoji: {
        fontSize: 24,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    message: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
    }
});
