import { getChallengeIconProps } from '@/src/utils/challengeIcons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    BoltIcon,
    CheckCircleIcon,
    XCircleIcon
} from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

export type ChallengeType = 'location' | 'trivia' | 'camera' | 'picture' | 'true_false' | 'dare' | 'riddle';

interface ActiveChallengeCardProps {
    title: string;
    points: number;
    content?: never; // Deprecated, use children instead
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

    const getBackgroundColors = (): [string, string] => {
        if (isCompleted) return [theme.challengeCorrectBackground, theme.challengeCorrectBackground];
        if (isFailed) return [theme.challengeFailedBackground, theme.challengeFailedBackground];
        return [theme.bgSecondary, theme.bgSecondary];
    };

    const getBorderColor = (): string => {
        if (isCompleted) return theme.challengeCorrectBorder;
        if (isFailed) return theme.challengeFailedBorder;
        return theme.borderPrimary;
    };

    const getIconColor = (): string => {
        if (isCompleted) return theme.success;
        if (isFailed) return theme.danger;

        try {
            // Need to convert type string to uppercase to match ChallengeType enum if needed
            // But getChallengeIconProps expects ChallengeType enum values or compatible strings
            // Casting type as any to bypass strict enum check if types don't perfectly align yet
            const challengeIconDetails = getChallengeIconProps(type.toUpperCase() as any, theme);
            return challengeIconDetails.color || theme.primary;
        } catch (e) {
            return theme.primary;
        }
    };

    const getIconName = (): any => {
        try {
            const challengeIconDetails = getChallengeIconProps(type.toUpperCase() as any, theme);
            return challengeIconDetails.icon || 'help-circle-outline';
        } catch (e) {
            return 'help-circle-outline';
        }
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
                    {isCompleted ? (
                        <CheckCircleIcon size={24} color={theme.success} />
                    ) : isFailed ? (
                        <XCircleIcon size={24} color={theme.danger} />
                    ) : (
                        <Ionicons name={getIconName()} size={24} color={getIconColor()} />
                    )}
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
                </View>
                <View style={styles.pointsBadge}>
                    <BoltIcon size={16} color={theme.gold} />
                    <Text style={[styles.pointsText, { color: theme.gold }]}>{points}</Text>
                </View>
            </View>



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

                <AnimatedPressable
                    style={
                        [
                            styles.button,
                            { backgroundColor: theme.secondary },
                            disabled && { backgroundColor: theme.textSecondary, opacity: 0.5 }
                        ]
                    }
                    onPress={onPress}
                    disabled={disabled}
                    interactionScale="medium"
                    haptic="light"
                >
                    <Text style={[styles.buttonText, { color: theme.textOnSecondary }]}>{actionLabel}</Text>
                </AnimatedPressable >
            )
            }
        </LinearGradient >
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
