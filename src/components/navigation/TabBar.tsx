import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { theme, mode } = useTheme();
    const insets = useSafeAreaInsets();

    // Correctly filter out hidden tabs based on options.href or tabBarStyle display
    const visibleRoutes = state.routes.filter(route => {
        const { options } = descriptors[route.key];
        const isHidden = (options as any).href === null;
        const hasIcon = options.tabBarIcon !== undefined;
        return !isHidden && hasIcon;
    });

    const isTabBarVisible = visibleRoutes.find(route => state.index === state.routes.indexOf(route));

    // Animation Logic
    const translateY = useSharedValue(0);

    useEffect(() => {
        if (isTabBarVisible) {
            translateY.value = withTiming(0, { duration: 300 });
        } else {
            // Hide by sliding down: Height + Spacing + extra buffer. 80 + 40 + 50 = 170
            translateY.value = withSpring(170, { damping: 15, stiffness: 100 });
        }
    }, [isTabBarVisible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    // Don't render if it's completely hidden/off-screen (optional optimization, but keep rendered for animation)
    // We can rely on translation to move it out.

    return (
        <Animated.View style={[styles.container, { paddingBottom: 40 }, animatedStyle]}>
            <BlurView
                intensity={80}
                tint={mode === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                style={[
                    styles.glassContainer,
                    {
                        borderColor: theme.navBarBorder,
                        backgroundColor: theme.navBarBackground,
                        shadowColor: theme.shadowColor
                    }
                ]}
            >
                {visibleRoutes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === state.routes.indexOf(route);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            isFocused={isFocused}
                            options={options}
                            onPress={onPress}
                            theme={theme}
                        />
                    );
                })}
            </BlurView>
        </Animated.View>
    );
}

const TabItem = ({ isFocused, options, onPress, theme }: any) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isFocused) {
            scale.value = withSpring(1.2, { damping: 12 });
        } else {
            scale.value = withTiming(1, { duration: 200 });
        }
    }, [isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const Icon = options.tabBarIcon;
    // Active color: Primary theme color. Inactive: Muted gray.
    const iconColor = isFocused ? theme.primary : theme.textSecondary;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
        >
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                {/* Clean, no Bubble. Just Icon. */}
                {Icon && <Icon color={iconColor} size={24} focused={isFocused} />}
            </Animated.View>
        </TouchableOpacity>
    );
};



const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 10, // Slightly wider than content (20px) for layered look
    },
    glassContainer: {
        flexDirection: 'row',
        width: '100%', // Fill the container (minus padding)
        height: 64,
        borderRadius: 32, // Full pill
        alignItems: 'center',
        justifyContent: 'space-evenly', // Even spacing
        // Glassmorphism aesthetic
        borderWidth: 1.5,
        overflow: 'hidden', // Essential for BlurView borderRadius
        // Premium shadows
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    }
});
