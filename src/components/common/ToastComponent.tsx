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
        right: 20,
        width: '30%',
        padding: 12,
        borderRadius: 12,
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    emoji: {
        fontSize: 18,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    message: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 11,
    }
});
