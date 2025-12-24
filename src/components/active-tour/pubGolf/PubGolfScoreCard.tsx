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
    const { theme } = useTheme();
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

    // Use holeInOne gradient for the card background as it's gold/orange
    const gradientColors = theme.pubGolf.holeInOne.slice(0, 3) as [string, string, string];

    return (
        <LinearGradient
            colors={[theme.accent, theme.primary]} // Orange to Pink gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                    <TrophyIcon size={32} color={theme.fixedWhite} />
                </View>
                <View>
                    <Text style={[styles.title, { color: theme.fixedWhite }]}>{t('pubgolf')}</Text>
                    <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.9)' }]}>{t('officialScorecard')}</Text>
                </View>
            </View>

            <View style={[styles.scoreContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={[styles.scoreLabel, { color: 'rgba(255,255,255,0.9)' }]}>{t('totalScore')}</Text>
                <Text style={[styles.scoreValue, { color: theme.fixedWhite }]}>{totalSips} / {totalPar}</Text>
                <View style={styles.statusContainer}>
                    <StatusIcon size={16} color={theme.fixedWhite} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: theme.fixedWhite }]}>{statusText}</Text>
                </View>
            </View>

            <AnimatedPressable
                style={[styles.toggleButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => setIsRulesOpen(!isRulesOpen)}
                interactionScale="subtle"
                haptic="light"
            >
                <Text style={[styles.toggleButtonText, { color: theme.fixedWhite }]}>
                    {t('viewRulesAndScoring') || "View Rules & Scoring"}
                </Text>
                {isRulesOpen ? (
                    <ChevronUpIcon size={20} color={theme.fixedWhite} />
                ) : (
                    <ChevronDownIcon size={20} color={theme.fixedWhite} />
                )}
            </AnimatedPressable>

            {isRulesOpen && (
                <View style={[styles.infoContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoText, { color: theme.fixedWhite }]}>
                            {t('pubGolfInstructions')}
                        </Text>
                    </View>

                    <View>
                        <Text style={[styles.legendTitle, { color: 'rgba(255,255,255,0.8)' }]}>
                            {t('scoring')} & {t('xp')}
                        </Text>
                        {PUB_GOLF_LEGEND_DATA.map((item) => (
                            <View key={item.nameKey} style={styles.legendRow}>
                                <View style={styles.legendItemLeft}>
                                    <Text style={styles.legendEmoji}>{item.emoji}</Text>
                                    <Text style={[styles.legendName, { color: theme.fixedWhite }]}>
                                        {t(item.nameKey as any)}
                                    </Text>
                                </View>
                                <View style={styles.legendXp}>
                                    <BoltIcon size={12} color={theme.fixedWhite} />
                                    <Text style={[styles.legendXpText, { color: theme.fixedWhite }]}>
                                        {item.xp} XP
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
