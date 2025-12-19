import React from 'react';
import { StyleProp, StyleSheet, ViewStyle, RefreshControlProps } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    withScrollView?: boolean;
    refreshControl?: React.ReactElement<RefreshControlProps>;
    animateEntry?: boolean;
}

/**
 * A wrapper for screens that applies a consistent entry animation (Spring-based Slide + Fade).
 * Also handles safe area insets and background color.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    withScrollView = false,
    refreshControl,
    animateEntry = true,
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const containerStyle = [
        styles.container,
        {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
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
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={refreshControl}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </Animated.ScrollView>
            </Animated.View>
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
