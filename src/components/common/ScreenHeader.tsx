import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from './TextComponent'; // Added import

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    style?: StyleProp<ViewStyle>;
    rightElement?: React.ReactNode;
    onBackPress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    subtitle,
    showBackButton = false,
    style,
    rightElement,
    onBackPress
}) => {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const paddingTop = style && (style as any).paddingTop !== undefined ? 0 : insets.top;

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.header, { paddingTop }, style]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {showBackButton && (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={[styles.backButton, { backgroundColor: theme.bgSecondary }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                )}

                <View style={styles.textContainer}>
                    <Animated.View entering={FadeInRight.delay(200).springify()}>
                        <TextComponent
                            style={styles.headerTitle}
                            color={theme.textPrimary}
                            bold
                            variant="h1" // Approx 34 is h1
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {title}
                        </TextComponent>
                    </Animated.View>
                    {subtitle && (
                        <Animated.View entering={FadeInRight.delay(300).springify()}>
                            <TextComponent
                                style={styles.headerSubtitle}
                                color={theme.textSecondary}
                                variant="body" // Approx 16 is body
                            >
                                {subtitle}
                            </TextComponent>
                        </Animated.View>
                    )}
                </View>
            </View>

            {rightElement && (
                <View style={styles.rightElement}>
                    {rightElement}
                </View>
            )}
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
        justifyContent: 'space-between', // Changed to space-between
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    // Added container for title/subtitle to center it if needed or let it flex
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerTitle: {
        marginBottom: 4,
    },
    headerSubtitle: {
        // handled by TextComponent default or override
    },
    rightElement: {
        marginLeft: 16,
    }
});
