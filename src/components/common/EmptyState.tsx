import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from './TextComponent'; // Added import

interface EmptyStateProps {
    /**
     * Icon name from Ionicons or a custom ReactNode
     */
    icon: keyof typeof Ionicons.glyphMap | React.ReactNode;
    title: string;
    message: string;
    action?: React.ReactNode;
    style?: ViewStyle;
    animate?: boolean;
}

export function EmptyState({ icon, title, message, action, style, animate = true }: EmptyStateProps) {
    const { theme } = useTheme();

    const Content = (
        <View style={[styles.container, style]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.bgSecondary }]}>
                {typeof icon === 'string' ? (
                    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={48} color={theme.textTertiary} />
                ) : (
                    icon
                )}
            </View>
            <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h2">{title}</TextComponent>
            <TextComponent style={styles.message} color={theme.textSecondary} variant="body">
                {message}
            </TextComponent>
            {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
    );

    if (animate) {
        return (
            <Animated.View entering={ZoomIn.springify()} style={[styles.wrapper, style]}>
                {Content}
            </Animated.View>
        );
    }

    return <View style={[styles.wrapper, style]}>{Content}</View>;
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
    },
    actionContainer: {
        marginTop: 8,
    },
});
