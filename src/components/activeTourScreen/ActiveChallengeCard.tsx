import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
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
    isFailed,
    onPress,
    actionLabel,
    children,
    disabled = false
}: ActiveChallengeCardProps & { disabled?: boolean, isFailed?: boolean }) {
    const { theme } = useTheme();
    const { t } = useLanguage();

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
            case 'location': return theme.accent; // Yellow
            case 'trivia': return theme.secondary; // Blue
            case 'camera': return theme.primary; // Pink
            default: return theme.primary;
        }
    };

    const getBorderColor = () => {
        if (isCompleted) return theme.success; // Green
        if (isFailed) return theme.danger; // Red
        return theme.borderPrimary;
    };

    const getBackgroundColors = (): [string, string, ...string[]] => {
        if (isCompleted) return [theme.success + '20', theme.success + '10']; // Light green gradient
        if (isFailed) return [theme.danger + '20', theme.danger + '10']; // Light red gradient
        return [theme.bgSecondary, theme.bgTertiary];
    };

    return (
        <LinearGradient
            colors={getBackgroundColors()}
            style={[
                styles.card,
                { borderColor: getBorderColor() }
            ]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <Ionicons name={getIconName()} size={24} color={getIconColor()} />
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
                </View>
                <View style={styles.pointsBadge}>
                    <Ionicons name="flash" size={16} color={theme.gold} />
                    <Text style={[styles.pointsText, { color: theme.gold }]}>{points}</Text>
                </View>
            </View>

            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                {description}
            </Text>

            {/* Always render children if provided, to show options even if completed/failed */}
            {children}

            {isCompleted ? (
                <View style={styles.completedContainer}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />
                    <Text style={[styles.completedText, { color: theme.success }]}>{t('challengeCompleted')}</Text>
                </View>
            ) : isFailed ? (
                <View style={styles.completedContainer}>
                    <Ionicons name="close-circle-outline" size={24} color={theme.danger} />
                    <Text style={[styles.completedText, { color: theme.danger }]}>{t('challengeFailed')}</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: getIconColor() },
                        disabled && { backgroundColor: theme.textSecondary, opacity: 0.5 }
                    ]}
                    onPress={onPress}
                    disabled={disabled}
                >
                    <Text style={[styles.buttonText, { color: theme.fixedWhite }]}>{actionLabel}</Text>
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
