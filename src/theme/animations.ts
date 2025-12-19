import { WithSpringConfig } from 'react-native-reanimated';

/**
 * Animation constants and configurations for the app.
 * DESIGN PHILOSOPHY: Snappy, spring-based, "felt but not watched".
 */

export const ANIMATION_DURATION = {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
};

export const SPRING_CONFIG: {
    DEFAULT: WithSpringConfig;
    BOUNCY: WithSpringConfig;
    STIFF: WithSpringConfig;
    SOFT: WithSpringConfig; // For page transitions
} = {
    DEFAULT: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
    BOUNCY: {
        damping: 10,
        stiffness: 100, // Lower stiffness = looser spring
        mass: 1,
    },
    STIFF: {
        damping: 20,
        stiffness: 200,
        mass: 0.8, // Lighter mass for snappiness
    },
    SOFT: {
        damping: 20,
        stiffness: 90,
        mass: 1,
    },
};

export const SCALE = {
    PRESSED_DEFAULT: 0.97,
    PRESSED_DEEP: 0.92,
    PRESSED_SUBTLE: 0.98,
};

export const OPACITY = {
    PRESSED: 0.8,
    DISABLED: 0.5,
};

// Generic transition spec for React Navigation
export const PAGE_TRANSITION_SPEC = {
    animation: 'spring',
    config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },
};
