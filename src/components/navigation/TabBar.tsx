import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LAYOUT } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { theme, mode } = useTheme();
    const insets = useSafeAreaInsets();

    // Correctly filter out hidden tabs based on options.href or tabBarStyle display
    const visibleRoutes = state.routes.filter(route => {
        const { options } = descriptors[route.key];
        // expo-router specific: hiding via href: null usually removes from state, but if not:
        // check if 'href' is null in options (needs type assertion or check)
        // Also check if tabBarButton is null

        // In some router versions, options.href might not be directly available on descriptor types,
        // but it's passed in options.
        const isHidden = (options as any).href === null;
        const hasIcon = options.tabBarIcon !== undefined;
        return !isHidden && hasIcon;
    });

    return (
        <View style={[styles.container, { paddingBottom: LAYOUT.BOTTOM_TAB_SPACING }]}>
            <BlurView
                intensity={80}
                tint={mode === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                style={[
                    styles.glassContainer,
                    {
                        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
                        backgroundColor: mode === 'dark' ? 'rgba(20,20,30,0.5)' : 'rgba(255,255,255,0.35)', // Lower opacity for glass
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
        </View>
    );
}

const TabItem = ({ isFocused, options, onPress, theme }: any) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1.2 : 1, { damping: 12 });
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

                {/* Subtle active dot indicator below icon */}
                {isFocused && (
                    <Animated.View
                        entering={FadeIn}
                        style={[styles.activeDot, { backgroundColor: theme.primary }]}
                    />
                )}
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
    },
    activeDot: {
        position: 'absolute',
        bottom: -6,
        width: 4,
        height: 4,
        borderRadius: 2,
    }
});
