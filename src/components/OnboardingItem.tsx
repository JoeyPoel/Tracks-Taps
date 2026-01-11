import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useTheme } from '@/src/context/ThemeContext';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type OnboardingItemProps = {
    item: {
        id: string;
        title: string;
        description: string;
        icon?: any;
    };
    index: number;
};

export default function OnboardingItem({ item, index }: OnboardingItemProps) {
    const { theme } = useTheme();
    const Icon = item.icon;

    // Pulse animation for the glow
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedGlowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulse.value }],
            opacity: withTiming(0.2),
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View
                    entering={FadeInUp.delay(index * 200).springify()}
                    style={styles.iconContainer}
                >
                    <Icon size={120} color={theme.primary} strokeWidth={1.5} />
                    <Animated.View style={[styles.glow, { backgroundColor: theme.primary }, animatedGlowStyle]} />
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(index * 200 + 300).springify()}
                >
                    <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h1" center>
                        {item.title}
                    </TextComponent>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(index * 200 + 500).springify()}
                >
                    <TextComponent style={styles.description} color={theme.textSecondary} variant="body" center>
                        {item.description}
                    </TextComponent>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -50,
    },
    iconContainer: {
        marginBottom: 60,
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        zIndex: -1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 10,
    },
});
