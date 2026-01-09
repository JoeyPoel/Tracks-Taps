import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface TourCardBaseProps {
    imageUrl: string;
    height?: number;
    onPress?: () => void;
    children: React.ReactNode;
}


export function TourCardBase({ imageUrl, height = 320, onPress, children }: TourCardBaseProps) {
    const { theme } = useTheme();

    // Use optimized URL with a default width of 600px (covers most phones @ 2x/3x density for this card size)
    const optimizedUrl = getOptimizedImageUrl(imageUrl, 600, { resize: 'contain' });

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[
                styles.card,
                { backgroundColor: theme.bgSecondary, height }
            ]}
            interactionScale="subtle"
        >
            <Image
                source={{ uri: optimizedUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="disk"
                transition={200}
            />

            <View style={styles.overlay} />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                locations={[0.3, 0.6, 1]}
                style={styles.gradient}
            >
                {children}
            </LinearGradient>
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
    // Removed imageBackground, imageStyle since we use absolute fill Image
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
