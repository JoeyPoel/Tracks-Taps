import React from 'react';
import { RefreshControlProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LAYOUT } from '../../constants/layout';
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

    const bottomPadding = withBottomTabs
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
                        withBottomTabs && { paddingBottom: LAYOUT.BOTTOM_TAB_SPACING + LAYOUT.TAB_BAR_HEIGHT } // Padding = Offset + Height
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
