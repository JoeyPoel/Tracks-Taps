import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { ScoreDetails } from '../../../utils/pubGolfUtils';

interface PubGolfStopHeaderProps {
    stopNumber: number;
    stopName: string;
    drinkName: string;
    par: number;
    sips?: number;
    scoreDetails: ScoreDetails | null;
    isCompleted: boolean;
    isActive: boolean;
}

export default function PubGolfStopHeader({
    stopNumber,
    stopName,
    drinkName,
    par,
    sips,
    scoreDetails,
    isCompleted,
    isActive,
}: PubGolfStopHeaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const textColor = isCompleted ? theme.fixedWhite : theme.textPrimary;
    const subTextColor = isCompleted ? 'rgba(255,255,255,0.7)' : theme.textSecondary; // Keeping rgba for transparency on white/colored bg

    const gradientColors = scoreDetails
        ? theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf].slice(0, 2) as [string, string]
        : isActive
            ? [theme.danger, theme.warning] as [string, string]
            : [theme.bgDisabled, theme.bgTertiary] as [string, string];

    return (
        <View style={styles.topSection}>
            {/* Left: Number Badge */}
            <LinearGradient
                colors={gradientColors}
                style={[styles.numberBadge, { shadowColor: theme.shadowColor }]}
            >
                <Text style={[styles.numberText, { color: theme.fixedWhite }]}>#{stopNumber}</Text>
            </LinearGradient>

            {/* Middle: Info */}
            <View style={styles.info}>
                <Text style={[styles.stopName, { color: textColor }]}>{stopName}</Text>
                <View style={[styles.drinkBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={[styles.drinkName, { color: isCompleted ? theme.fixedWhite : theme.textSecondary }]}>
                        {drinkName}
                    </Text>
                </View>
            </View>

            {/* Right: Score & Par */}
            <View style={styles.rightSection}>
                <View style={styles.parTag}>
                    <Text style={{ fontSize: 10, color: subTextColor, marginRight: 2 }}>{t('par')}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: subTextColor }}>{par}</Text>
                </View>

                {isCompleted && scoreDetails && (
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreEmojiBg}>{scoreDetails.emoji}</Text>
                        <Text style={[styles.scoreValue, { color: theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf][0] }]}>
                            {sips}
                        </Text>
                    </View>
                )}
                {/* Show just Par if not completed */}
                {!isCompleted && (
                    <View style={styles.scoreContainer}>
                        <Ionicons name="flag-outline" size={24} color={subTextColor} style={{ opacity: 0.2 }} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    numberBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    numberText: {
        fontWeight: '900',
        fontSize: 18,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    stopName: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    drinkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    drinkName: {
        fontSize: 12,
        marginRight: 6,
        fontWeight: '500',
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minWidth: 50,
    },
    parTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    scoreContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    scoreEmojiBg: {
        position: 'absolute',
        fontSize: 46,
        lineHeight: 50,
        width: 60,
        height: 60,
        textAlign: 'center',
        right: 35,
        bottom: -5,
        transform: [{ rotate: '-10deg' }],
        zIndex: 1,
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        zIndex: 2,
    },
});
