import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ActiveTourHeaderProps {
    level: number;
    currentXP: number;
    maxXP: number;
    currentStop: number;
    totalStops: number;
    streak: number;
    tokens: number;
    onClose: () => void;
}

export default function ActiveTourHeader({
    level,
    currentXP,
    maxXP,
    currentStop,
    totalStops,
    streak,
    tokens,
    onClose,
}: ActiveTourHeaderProps) {
    const { theme } = useTheme();

    const xpProgress = Math.min(Math.max(currentXP / maxXP, 0), 1) * 100;
    const stopProgress = Math.min(Math.max(currentStop / totalStops, 0), 1) * 100;

    const xpAnim = useRef(new Animated.Value(0)).current;
    const stopAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(xpAnim, {
                toValue: xpProgress,
                duration: 1000,
                useNativeDriver: false,
            }),
            Animated.timing(stopAnim, {
                toValue: stopProgress,
                duration: 1000,
                useNativeDriver: false,
            }),
        ]).start();
    }, [xpProgress, stopProgress]);

    const xpWidth = xpAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const stopWidth = stopAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            {/* Row 1: Close + Stats */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>

                <View style={styles.statsContainer}>
                    <View style={styles.statBadge}>
                        <Ionicons name="flame" size={16} color="#FF5722" />
                        <Text style={[styles.statText, { color: theme.textPrimary }]}>{streak}</Text>
                    </View>
                    <View style={styles.statBadge}>
                        <Ionicons name="flash" size={16} color="#E91E63" />
                        <Text style={[styles.statText, { color: theme.textPrimary }]}>{tokens}</Text>
                    </View>
                </View>
            </View>

            {/* Row 2: Level + XP Text */}
            <View style={styles.levelRow}>
                <View style={styles.levelBadge}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={[styles.levelText, { color: theme.warning }]}>Level {level}</Text>
                </View>
                <Text style={[styles.xpText, { color: theme.textSecondary }]}>{currentXP} / {maxXP} XP</Text>
            </View>

            {/* Row 3: XP Bar */}
            <View style={styles.xpBarContainer}>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: xpWidth, backgroundColor: '#FF5722' }]} />
                </View>
            </View>

            {/* Row 4: Stop Info + Stop Bar */}
            <View style={styles.stopRow}>
                <Text style={[styles.stopText, { color: theme.textSecondary }]}>
                    Stop {currentStop} / {totalStops}
                </Text>
                <View style={styles.stopBarContainer}>
                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, { width: stopWidth, backgroundColor: '#E91E63' }]} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10, // Safe area
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButton: {
        padding: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    statText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    levelText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    xpText: {
        fontSize: 12,
    },
    xpBarContainer: {
        marginBottom: 12,
    },
    stopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stopText: {
        fontSize: 14,
        minWidth: 70,
    },
    stopBarContainer: {
        flex: 1,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});
