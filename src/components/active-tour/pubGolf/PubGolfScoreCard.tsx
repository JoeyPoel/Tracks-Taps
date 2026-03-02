import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon, ExclamationCircleIcon, FireIcon, FlagIcon, TrophyIcon } from 'react-native-heroicons/outline';
import { BoltIcon } from 'react-native-heroicons/solid';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { PUB_GOLF_LEGEND_DATA } from '../../../utils/pubGolfUtils';
import { AnimatedPressable } from '../../common/AnimatedPressable';

interface PubGolfScoreCardProps {
    totalSips: number;
    totalPar: number;
    currentScore: number; // Sum of (sips - par)
}

export default function PubGolfScoreCard({ totalSips, totalPar, currentScore }: PubGolfScoreCardProps) {
    const { theme, mode } = useTheme();
    const { t } = useLanguage();
    const [isRulesOpen, setIsRulesOpen] = useState(false);

    const isUnderPar = currentScore < 0;
    const isOverPar = currentScore > 0;
    const isEven = currentScore === 0;

    let statusText = t('evenPar');
    let StatusIcon = FlagIcon;

    if (isUnderPar) {
        statusText = t('underPar');
        StatusIcon = FireIcon;
    } else if (isOverPar) {
        statusText = t('overPar');
        StatusIcon = ExclamationCircleIcon;
    }

    const isLight = mode === 'light';
    const gradientColors = isLight
        ? [theme.bgSecondary, theme.bgTertiary] as [string, string]
        : [theme.accent, theme.primary] as [string, string];

    const cardTextColor = isLight ? theme.textPrimary : theme.fixedWhite;
    const cardSubTextColor = isLight ? theme.textSecondary : 'rgba(255,255,255,0.9)';
    const overlayColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)';

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, isLight && { borderWidth: 1, borderColor: theme.borderPrimary }]}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: isLight ? theme.primary : 'rgba(255,255,255,0.3)' }]}>
                    <TrophyIcon size={32} color={theme.fixedWhite} />
                </View>
                <View>
                    <Text style={[styles.title, { color: cardTextColor }]}>{t('pubgolf')}</Text>
                    <Text style={[styles.subtitle, { color: cardSubTextColor }]}>{t('officialScorecard')}</Text>
                </View>
            </View>

            <View style={[styles.scoreContainer, { backgroundColor: overlayColor }]}>
                <Text style={[styles.scoreLabel, { color: cardSubTextColor }]}>{t('totalScore')}</Text>
                <Text style={[styles.scoreValue, { color: cardTextColor }]}>{totalSips} / {totalPar}</Text>
                <View style={styles.statusContainer}>
                    <StatusIcon size={16} color={isLight ? theme.primary : theme.fixedWhite} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: isLight ? theme.primary : theme.fixedWhite }]}>{statusText}</Text>
                </View>
            </View>

            <AnimatedPressable
                style={[styles.toggleButton, { backgroundColor: overlayColor }]}
                onPress={() => setIsRulesOpen(!isRulesOpen)}
                interactionScale="subtle"
                haptic="light"
            >
                <Text style={[styles.toggleButtonText, { color: cardTextColor }]}>
                    {t('viewRulesAndScoring')}
                </Text>
                {isRulesOpen ? (
                    <ChevronUpIcon size={20} color={cardTextColor} />
                ) : (
                    <ChevronDownIcon size={20} color={cardTextColor} />
                )}
            </AnimatedPressable>

            {isRulesOpen && (
                <View style={[styles.infoContainer, { backgroundColor: isLight ? theme.bgPrimary : 'rgba(255,255,255,0.1)' }]}>
                    <View style={[styles.infoRow, { borderBottomColor: isLight ? theme.borderPrimary : 'rgba(255,255,255,0.1)' }]}>
                        <Text style={[styles.infoText, { color: cardTextColor }]}>
                            {t('pubGolfInstructions')}
                        </Text>
                    </View>

                    <View>
                        <Text style={[styles.legendTitle, { color: cardSubTextColor }]}>
                            {t('scoring')} & {t('xp')}
                        </Text>
                        {PUB_GOLF_LEGEND_DATA.map((item) => (
                            <View key={item.nameKey} style={styles.legendRow}>
                                <View style={styles.legendItemLeft}>
                                    <Text style={styles.legendEmoji}>{item.emoji}</Text>
                                    <Text style={[styles.legendName, { color: cardTextColor }]}>
                                        {t(item.nameKey as any)}
                                    </Text>
                                </View>
                                <View style={styles.legendXp}>
                                    <BoltIcon size={12} color={theme.gold} />
                                    <Text style={[styles.legendXpText, { color: theme.gold }]}>
                                        {item.xp} {t('xp')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 24,
        marginVertical: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '55%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
    },
    scoreContainer: {
        width: '40%',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    toggleButton: {
        width: '100%',
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleButtonText: {
        fontWeight: '600',
        marginRight: 8,
    },
    infoContainer: {
        width: '100%',
        marginTop: 8,
        borderRadius: 12,
        padding: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    legendItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendEmoji: {
        marginRight: 8,
        fontSize: 16,
    },
    legendName: {
        fontSize: 14,
        fontWeight: '500',
    },
    legendXp: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendXpText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});
