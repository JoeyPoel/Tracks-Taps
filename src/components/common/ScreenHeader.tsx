import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    subtitle,
    showBackButton = false,
    style
}) => {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const paddingTop = style && (style as any).paddingTop !== undefined ? 0 : insets.top;

    return (
        <View style={[styles.header, { paddingTop }, style]}>
            {showBackButton && (
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: theme.bgSecondary }]}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
            )}

            <View style={styles.textContainer}>
                <Animated.Text
                    entering={FadeInRight.delay(200).springify()}
                    style={[styles.headerTitle, { color: theme.textPrimary }]}
                >
                    {title}
                </Animated.Text>
                {subtitle && (
                    <Animated.Text
                        entering={FadeInRight.delay(300).springify()}
                        style={[styles.headerSubtitle, { color: theme.textSecondary }]}
                    >
                        {subtitle}
                    </Animated.Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        // marginTop: 10, // Removed to let safe area handle top spacing
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
});
