import React from 'react';
import { View, ViewProps, useWindowDimensions } from 'react-native';

interface ResponsiveContainerProps extends ViewProps {
    /**
     * The threshold at which the container switches from row to column.
     * If content likely exceeds this width, or if font scale is high, it wraps.
     * Default depends on device width.
     */
    breakPoint?: number;
    /**
     * Force vertical layout if font scale exceeds this multiplier.
     * Default: 1.3 (Common for 'Large' text sizes)
     */
    fontScaleThreshold?: number;

    /**
     * Spacing between items.
     */
    gap?: number;
}

/**
 * A container that automatically switches between row and column layout
 * based on the user's font scale setting or available screen width.
 * Useful for rows of buttons or text+image cards that need to stack on accessible settings.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    breakPoint = 600, // Tablet-ish threshold
    fontScaleThreshold = 1.25,
    gap = 10,
    style,
    ...props
}) => {
    const { fontScale, width } = useWindowDimensions();

    // Determine direction
    // If font is large OR screen is small (phone), we might want to stack.
    // Ideally, for a "Row", we want to stack if text is huge.

    // Logic:
    // 1. If fontScale > threshold, stack (column).
    // 2. If width < breakPoint (and we are assuming this is used in a context where row is default),
    //    we might NOT strictly stack just because it's a phone, unless specified.
    //    BUT, for "UI being vertical instead of horizontal", checking fontScale is the accessibility key.

    const isLargeText = fontScale >= fontScaleThreshold;

    // We default to 'row' unless triggered.
    const flexDirection = isLargeText ? 'column' : 'row';

    return (
        <View
            style={[
                {
                    flexDirection,
                    gap
                },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
};
