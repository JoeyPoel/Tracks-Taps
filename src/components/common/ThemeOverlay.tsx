import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';

const { width, height } = Dimensions.get('window');

const Heart = ({ delay, startX }: { delay: number; startX: number }) => {
    const translateY = useSharedValue(height);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);
    const translateX = useSharedValue(startX);

    useEffect(() => {
        const floatDuration = 8000 + Math.random() * 4000;
        
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-(height + 100), { duration: floatDuration, easing: Easing.linear }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 1000 }), // Fade in
                    withTiming(0.7, { duration: floatDuration * 0.5 }), // Stay visible for half the journey
                    withTiming(0, { duration: floatDuration * 0.5 - 1000 }) // Slowly fade out as it reaches the top
                ),
                -1,
                false
            )
        );
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1 + Math.random() * 0.5, { duration: floatDuration / 2 }),
                    withTiming(0.8 + Math.random() * 0.5, { duration: floatDuration / 2 })
                ),
                -1,
                true
            )
        );
        const randomSwing = 30 + Math.random() * 50;
        translateX.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(startX + randomSwing, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(startX - randomSwing, { duration: 3000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );
    }, [delay, startX, translateY, opacity, scale, translateX]);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
        bottom: 0,
    }));

    return (
        <Animated.View style={style} pointerEvents="none">
            <HeartSolid size={32} color="#FF1493" />
        </Animated.View>
    );
};

export const ThemeOverlay = ({ trigger, type }: { trigger: number; type: string | null }) => {
    const [activeType, setActiveType] = React.useState<string | null>(null);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (trigger > 0 && type) {
            setActiveType(type);
            timeout = setTimeout(() => {
                setActiveType(null);
            }, 60000); // 1 minute
        } else {
            setActiveType(null);
        }
        return () => clearTimeout(timeout);
    }, [trigger, type]);

    // Create 15 hearts unconditionally so hooks run on every render
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hearts = useMemo(() => Array.from({ length: 15 }).map((_, i) => {
        const segmentWidth = width / 15;
        const startX = (i * segmentWidth) + (Math.random() * (segmentWidth * 0.8));
        return <Heart key={`${trigger}-${i}`} delay={i * 300} startX={startX} />
    }), [trigger]);

    if (!activeType) return null;

    return (
        <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]} pointerEvents="none">
            {activeType === 'romantic' && hearts}
        </Animated.View>
    );
};
