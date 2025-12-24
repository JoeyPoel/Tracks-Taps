import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
    index: number;
    isLast: boolean;
}

export function TimelineLeft({ index, isLast }: Props) {
    const { theme } = useTheme();
    return (
        <View style={styles.timelineLeft}>
            <View style={[styles.timelineDot, { backgroundColor: theme.primary }]}>
                <Text style={styles.timelineIndex}>{index + 1}</Text>
            </View>
            {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.borderPrimary }]} />}
        </View>
    );
}

const styles = StyleSheet.create({
    timelineLeft: {
        alignItems: 'center',
        width: 40,
        marginRight: 12,
    },
    timelineDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineIndex: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
});
