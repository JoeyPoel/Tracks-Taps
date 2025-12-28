import { usePathname } from 'expo-router';
import React from 'react';
import { RefreshControlProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    withScrollView?: boolean;
    withBottomTabs?: boolean;
    refreshControl?: React.ReactElement<RefreshControlProps>;
    animateEntry?: boolean;
    includeTop?: boolean;
    includeBottom?: boolean;
}

/**
 * A wrapper for screens that applies a consistent entry animation (Spring-based Slide + Fade).
 * Also handles safe area insets and background color.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    withScrollView = false,
    withBottomTabs = false,
    refreshControl,
    animateEntry = true,
    includeTop = true,
    includeBottom = true,
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    // Auto-detect if we are on a main tab screen
    // We can check the route name provided by expo-router or the pathname
    // Simple heuristic: If the route is one of the main tabs, we need bottom spacing.
    // Note: We'd need to import usePathname from expo-router. Since we can't easily change imports in this block, 
    // we'll rely on the user passing it OR we can try to infer it if we had the route.
    const pathname = usePathname();

    // List of routes that ALWAYS show the bottom tab bar
    // This allows us to auto-apply padding without manually passing the prop every time
    const tabRoutes = ['/explore', '/join', '/create', '/map', '/profile'];
    const isTabRoute = tabRoutes.includes(pathname) || pathname === '/' || pathname === '';

    // Use prop if explicitly provided, otherwise fallback to auto-detection
    const showBottomTabs = withBottomTabs !== undefined ? withBottomTabs : isTabRoute;

    const bottomPadding = showBottomTabs
        ? 0 // Allow content to flow behind the tab bar
        : (includeBottom ? insets.bottom : 0);

    const containerStyle = [
        styles.container,
        {
            paddingTop: includeTop ? insets.top : 0,
            paddingBottom: bottomPadding,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: theme.bgPrimary
        },
        style
    ];

    // Soft slide-in and fade using Reanimated Entering animation
    // Damping and stiffness tuned for "felt but not watched"
    const enteringAnimation = SlideInRight.springify()
        .damping(18)
        .stiffness(120)
        .mass(1)
        .withInitialValues({ opacity: 0, transform: [{ translateX: 20 }] }); // Subtle slide, mostly fade

    if (withScrollView) {
        return (
            <Animated.View
                style={containerStyle}
                entering={animateEntry ? enteringAnimation : undefined}
            >
                <Animated.ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[
                        styles.scrollContent,
                        showBottomTabs && { paddingBottom: 80 + 40 } // Padding = Offset + Height
                    ]}
                    refreshControl={refreshControl}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </Animated.ScrollView>
            </Animated.View >
        );
    }

    return (
        <Animated.View style={containerStyle} entering={animateEntry ? enteringAnimation : undefined}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    }
});
