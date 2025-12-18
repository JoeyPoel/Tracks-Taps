import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BoltIcon } from 'react-native-heroicons/solid';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { ScoreDetails } from '../../../utils/pubGolfUtils';

interface PubGolfResultFooterProps {
    scoreDetails: ScoreDetails;
    diffText: string;
}

export default function PubGolfResultFooter({
    scoreDetails,
    diffText,
}: PubGolfResultFooterProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.resultFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <View>
                <Text style={[styles.resultText, { color: theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf][0] }]}>
                    {t(scoreDetails.nameKey as any)} <Text style={{ color: theme.textSecondary, fontWeight: 'normal' }}>{t(scoreDetails.subKey as any)}</Text> {diffText}
                </Text>
                {scoreDetails.recommendedXP > 0 && (
                    <View style={styles.xpContainer}>
                        <BoltIcon size={14} color={theme.gold} />
                        <Text style={[styles.xpText, { color: theme.gold }]}>
                            +{scoreDetails.recommendedXP} XP
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    resultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    resultEmoji: {
        fontSize: 18,
    },
    resultText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    xpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    xpText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});
