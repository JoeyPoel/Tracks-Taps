import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FadeInListProps {
    children: React.ReactNode;
    delay?: number;
    stagger?: number;
    style?: ViewStyle;
}

export function FadeInList({ children, delay = 0, stagger = 100, style }: FadeInListProps) {
    const items = React.Children.toArray(children);

    return (
        <Animated.View style={style}>
            {items.map((child, index) => (
                <Animated.View
                    key={index}
                    entering={
                        FadeInDown
                            .delay(delay + index * stagger)
                            .springify()
                            .damping(20)
                            .mass(0.8)
                    }
                >
                    {child}
                </Animated.View>
            ))}
        </Animated.View>
    );
}

// FadeInItem for individual items
export function FadeInItem({ children, delay = 0, index = 0 }: { children: React.ReactNode, delay?: number, index?: number }) {
    return (
        <Animated.View
            entering={
                FadeInDown
                    .delay(delay + index * 100)
                    .springify()
                    .damping(20)
                    .mass(0.8)
            }
        >
            {children}
        </Animated.View>
    );
}
