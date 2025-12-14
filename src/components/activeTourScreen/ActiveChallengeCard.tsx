import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    BoltIcon,
    CameraIcon,
    CheckCircleIcon,
    FireIcon,
    KeyIcon,
    MapPinIcon,
    QuestionMarkCircleIcon,
    XCircleIcon
} from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export type ChallengeType = 'location' | 'trivia' | 'camera' | 'picture' | 'true_false' | 'dare' | 'riddle';

interface ActiveChallengeCardProps {
    title: string;
    points: number;
    description: string;
    type: ChallengeType;
    isCompleted: boolean;
    isFailed: boolean;
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

    const getIconComponent = () => {
        // Safe mapping with strict types
        switch (type) {
            case 'location': return MapPinIcon;
            case 'trivia': return QuestionMarkCircleIcon;
            case 'camera': return CameraIcon;
            case 'picture': return CameraIcon;
            case 'true_false': return CheckCircleIcon;
            case 'dare': return FireIcon;
            case 'riddle': return KeyIcon;
            default: return QuestionMarkCircleIcon;
        }
    };

    const StatusIcon = getIconComponent() || QuestionMarkCircleIcon;

    const getIconColor = () => {
        switch (type) {
            case 'location': return theme.accent; // Yellow
            case 'trivia': return theme.secondary; // Blue
            case 'camera': return theme.primary; // Pink
            case 'picture': return theme.primary;
            case 'true_false': return theme.secondary;
            case 'dare': return theme.danger; // Red/Attention
            case 'riddle': return theme.accent; // Yellow/Mystery
            default: return theme.primary;
        }
    };

    const getBorderColor = () => {
        if (isCompleted) return theme.challengeCorrectBorder; // Green
        if (isFailed) return theme.challengeFailedBorder; // Red
        return theme.borderPrimary;
    };

    const getBackgroundColors = (): [string, string, ...string[]] => {
        if (isCompleted) return [theme.challengeCorrectBackground, theme.challengeCorrectBackground];
        if (isFailed) return [theme.challengeFailedBackground, theme.challengeFailedBackground];
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
                    <StatusIcon size={24} color={getIconColor()} />
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
                </View>
                <View style={styles.pointsBadge}>
                    <BoltIcon size={16} color={theme.gold} />
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
                    <CheckCircleIcon size={24} color={theme.success} />
                    <Text style={[styles.completedText, { color: theme.success }]}>{t('challengeCompleted')}</Text>
                </View>
            ) : isFailed ? (
                <View style={styles.completedContainer}>
                    <XCircleIcon size={24} color={theme.danger} />
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
