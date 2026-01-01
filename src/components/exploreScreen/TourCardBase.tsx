import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface TourCardBaseProps {
    imageUrl: string;
    height?: number;
    onPress?: () => void;
    children: React.ReactNode;
}

export function TourCardBase({ imageUrl, height = 320, onPress, children }: TourCardBaseProps) {
    const { theme } = useTheme();

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[
                styles.card,
                { backgroundColor: theme.bgSecondary, height }
            ]}
            interactionScale="subtle"
        >
            <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground} imageStyle={styles.imageStyle}>
                <View style={styles.overlay} />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                    locations={[0.3, 0.6, 1]}
                    style={styles.gradient}
                >
                    {children}
                </LinearGradient>
            </ImageBackground>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'space-between',
    },
    imageStyle: {
        borderRadius: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    gradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
});
