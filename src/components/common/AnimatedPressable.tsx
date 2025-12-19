import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SCALE, SPRING_CONFIG } from '../../theme/animations';
import { HapticType, triggerHaptic } from '../../utils/haptics';

export interface AnimatedPressableProps extends PressableProps {
    /**
     * The strength of the scale effect interaction.
     * - 'subtle': 0.98 scale
     * - 'medium': 0.97 scale (default)
     * - 'deep': 0.92 scale
     */
    interactionScale?: 'subtle' | 'medium' | 'deep' | 'none';

    /**
     * Impact style for haptic feedback on press.
     */
    haptic?: HapticType | 'none';

    /**
     * Custom style for the container.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Pass children to render inside.
     */
    children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);

    /**
     * Whether to animate opacity on press (default: false for scale-based interactions to keep it clean)
     */
    animateOpacity?: boolean;
}

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

/**
 * A reusable, high-performance Pressable component with built-in spring animations and haptic feedback.
 * 
 * Usage:
 * <AnimatedPressable onPress={handleSubmit} haptic="success">
 *   <Text>Submit</Text>
 * </AnimatedPressable>
 */
export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
    interactionScale = 'medium',
    haptic = 'light',
    style,
    children,
    onPress,
    onPressIn,
    onPressOut,
    animateOpacity = false,
    disabled,
    ...props
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const getTargetScale = () => {
        if (disabled) return 1;
        switch (interactionScale) {
            case 'subtle': return SCALE.PRESSED_SUBTLE;
            case 'medium': return SCALE.PRESSED_DEFAULT;
            case 'deep': return SCALE.PRESSED_DEEP;
            case 'none': return 1;
            default: return SCALE.PRESSED_DEFAULT;
        }
    };

    const currentScaleTarget = getTargetScale();

    const handlePressIn = (event: any) => {
        if (!disabled) {
            scale.value = withSpring(currentScaleTarget, SPRING_CONFIG.STIFF);
            if (haptic !== 'none') {
                runOnJS(triggerHaptic)(haptic);
            }
            if (animateOpacity) {
                opacity.value = withTiming(0.8, { duration: 100 });
            }
        }
        onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
        if (!disabled) {
            scale.value = withSpring(1, SPRING_CONFIG.STIFF);
            if (animateOpacity) {
                opacity.value = withTiming(1, { duration: 150 });
            }
        }
        onPressOut?.(event);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <AnimatedPressableComponent
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
            style={[
                style,
                animatedStyle
            ] as any} // Cast to any to avoid complex Animated Style type mismatches related to ViewStyle
            {...props}
        >
            {children}
        </AnimatedPressableComponent>
    );
};
