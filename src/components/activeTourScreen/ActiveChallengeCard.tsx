import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type ChallengeType = 'location' | 'trivia' | 'camera';

interface ActiveChallengeCardProps {
    title: string;
    points: number;
    description: string;
    type: ChallengeType;
    isCompleted: boolean;
    onPress: () => void;
    actionLabel: string;
    children?: React.ReactNode;
}

export default function ActiveChallengeCard({
    title,
    points,
    description,
    type,
    isCompleted,
    onPress,
    actionLabel,
    children
}: ActiveChallengeCardProps) {
    const { theme } = useTheme();

    const getIconName = () => {
        switch (type) {
            case 'location': return 'location-outline';
            case 'trivia': return 'help-circle-outline';
            case 'camera': return 'camera-outline';
            default: return 'help-circle-outline';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'location': return '#FFC107'; // Yellow
            case 'trivia': return '#2AC3FF'; // Blue
            case 'camera': return '#FF375D'; // Pink
            default: return theme.primary;
        }
    };

    return (
        <LinearGradient
            colors={[theme.bgSecondary, theme.bgTertiary]}
            style={[
                styles.card,
                { borderColor: isCompleted ? theme.success : theme.borderPrimary }
            ]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <Ionicons name={getIconName()} size={24} color={getIconColor()} />
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
                </View>
                <View style={styles.pointsBadge}>
                    <Ionicons name="flash" size={16} color="#FFD700" />
                    <Text style={styles.pointsText}>{points}</Text>
                </View>
            </View>

            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                {description}
            </Text>

            {!isCompleted && children}

            {isCompleted ? (
                <View style={styles.completedContainer}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />
                    <Text style={[styles.completedText, { color: theme.success }]}>Challenge Completed!</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: getIconColor() }]}
                    onPress={onPress}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pointsText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardDescription: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    completedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        padding: 8,
        marginTop: 8,
        gap: 8,
    },
    completedText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
