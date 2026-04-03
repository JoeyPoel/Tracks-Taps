import { getChallengeIconProps } from '@/src/utils/challengeIcons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import {
    BoltIcon,
    CheckCircleIcon,
    XCircleIcon
} from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../context/TranslationContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { TextComponent } from '../common/TextComponent';

export type ChallengeType = 'location' | 'trivia' | 'camera' | 'picture' | 'true_false' | 'dare' | 'riddle' | 'check_in';

interface ActiveChallengeCardProps {
    title: string;
    points: number;
    content?: never;
    type: ChallengeType;
    isCompleted: boolean;
    isFailed: boolean;
    onPress: () => void;
    actionLabel: string;
    children?: React.ReactNode;
    index?: number;
    isBonus?: boolean;
    translateText?: string;
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
    disabled = false,
    index = 0,
    isBonus = false,
    translateText: translateTextProp
}: ActiveChallengeCardProps & { disabled?: boolean, isFailed?: boolean, index?: number, isBonus?: boolean, translateText?: string }) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { translateText, isAutoTranslateEnabled } = useTranslation();

    const displayedTranslateText = translateText(translateTextProp || '');

    // Entrance Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    // Feedback Animations
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Refs to track previous states to prevent re-triggering animations on mount
    const prevCompleted = useRef(isCompleted);
    const prevFailed = useRef(isFailed);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        // Only run animations if the state changed from false to true
        if (isCompleted && !prevCompleted.current) {
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
            ]).start();
        } else if (isFailed && !prevFailed.current) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 5, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -5, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
            ]).start();
        }

        // Update previous states
        prevCompleted.current = isCompleted;
        prevFailed.current = isFailed;
    }, [isCompleted, isFailed]);

    const getBorderColors = (): [string, string] => {
        if (isCompleted) return [theme.success, theme.success + '50'];
        if (isFailed) return [theme.danger, theme.danger + '50'];
        if (isBonus) return [theme.gold, theme.gold + '50'];
        return [theme.primary, theme.secondary];
    };

    const getBackgroundColors = (): [string, string] => {
        if (isCompleted) return [theme.bgSuccess, theme.bgPrimary];
        if (isFailed) return [theme.challengeFailedBackground, theme.bgPrimary];
        return [theme.bgSecondary, theme.bgSecondary];
    };

    const getIconColor = (): string => {
        if (isCompleted) return theme.success;
        if (isFailed) return theme.danger;
        try {
            const challengeIconDetails = getChallengeIconProps(type.toUpperCase() as any, theme, t);
            return challengeIconDetails.color || theme.primary;
        } catch (_e) {
            return theme.primary;
        }
    };

    const getIconName = (): any => {
        try {
            const challengeIconDetails = getChallengeIconProps(type.toUpperCase() as any, theme, t);
            return challengeIconDetails.icon || 'help-circle-outline';
        } catch (_e) {
            return 'help-circle-outline';
        }
    };

    return (
        <Animated.View style={{ 
            opacity: fadeAnim, 
            transform: [
                { translateY }, 
                { scale: scaleAnim }, 
                { translateX: shakeAnim }
            ] 
        }}>
            {/* Gradient Border Container */}
            <LinearGradient
                colors={getBorderColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.borderContainer}
            >
                <LinearGradient
                    colors={getBackgroundColors()}
                    style={styles.innerCard}
                >
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            <View style={[styles.iconContainer, { backgroundColor: isCompleted ? theme.success + '20' : isFailed ? theme.danger + '20' : theme.primary + '10' }]}>
                                {isCompleted ? (
                                    <CheckCircleIcon size={22} color={theme.success} />
                                ) : isFailed ? (
                                    <XCircleIcon size={22} color={theme.danger} />
                                ) : (
                                    <Ionicons name={getIconName()} size={22} color={getIconColor()} />
                                )}
                            </View>
                            <TextComponent style={styles.cardTitle} color={theme.textPrimary} bold variant="body">{title}</TextComponent>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                            <View style={[styles.pointsBadge, { backgroundColor: theme.gold + '20' }]}>
                                <BoltIcon size={14} color={theme.gold} />
                                <TextComponent style={styles.pointsText} color={theme.gold} bold variant="label">{points}</TextComponent>
                            </View>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        {children}
                    </View>

                    {/* Footer Actions */}
                    {isCompleted ? (
                        <View style={[styles.statusContainer, { backgroundColor: theme.success + '10' }]}>
                            <CheckCircleIcon size={20} color={theme.success} />
                            <TextComponent style={styles.statusText} color={theme.success} bold variant="body">{t('challengeCompleted')}</TextComponent>
                        </View>
                    ) : isFailed ? (
                        <View style={[styles.statusContainer, { backgroundColor: theme.danger + '10' }]}>
                            <XCircleIcon size={20} color={theme.danger} />
                            <TextComponent style={styles.statusText} color={theme.danger} bold variant="body">{t('challengeFailed')}</TextComponent>
                        </View>
                    ) : (
                        <AnimatedPressable
                            style={[
                                styles.button,
                                {
                                    backgroundColor: theme.primary,
                                    shadowColor: theme.primary
                                },
                                disabled && { backgroundColor: theme.bgDisabled, opacity: 0.8 }
                            ]}
                            onPress={onPress}
                            disabled={disabled}
                            interactionScale="medium"
                            haptic="light"
                        >
                            <TextComponent 
                                style={styles.buttonText} 
                                color={disabled ? theme.textTertiary : theme.fixedWhite} 
                                bold 
                                variant="body"
                            >
                                {actionLabel}
                            </TextComponent>
                            {!disabled && <Ionicons name="arrow-forward" size={18} color={theme.fixedWhite} />}
                        </AnimatedPressable>
                    )}
                </LinearGradient>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    borderContainer: {
        borderRadius: 24,
        padding: 2, // Width of border
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    innerCard: {
        borderRadius: 22, // 24 - 2 padding
        padding: 16,
        minHeight: 120,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        flex: 1,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pointsText: {
        // handled by TextComponent
    },
    contentContainer: {
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonText: {
        letterSpacing: 0.3,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        padding: 12,
        gap: 8,
    },
    statusText: {
        // handled by TextComponent
    },
});
