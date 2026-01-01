import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type OnboardingItemProps = {
    item: {
        id: string;
        title: string;
        description: string;
        icon?: any;
        image?: any;
    };
    index: number;
};

export default function OnboardingItem({ item, index }: OnboardingItemProps) {
    const { theme } = useTheme();
    const Icon = item.icon;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View
                    entering={FadeInUp.delay(index * 200).springify()}
                    style={styles.iconContainer}
                >
                    {item.image ? (
                        <Image
                            source={item.image}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    ) : (
                        <>
                            <Icon size={80} color={theme.primary} strokeWidth={1.5} />
                            <View style={[styles.glow, { backgroundColor: theme.primary }]} />
                        </>
                    )}
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
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.15,
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
    image: {
        width: width * 0.8,
        height: width * 0.8,
    },
});
