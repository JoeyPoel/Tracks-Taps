import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
            <Text style={[styles.resultEmoji, { marginRight: 8 }]}>{scoreDetails.emoji}</Text>
            <Text style={[styles.resultText, { color: theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf][0] }]}>
                {t(scoreDetails.nameKey as any)} <Text style={{ color: theme.textSecondary, fontWeight: 'normal' }}>{t(scoreDetails.subKey as any)}</Text> {diffText}
            </Text>
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
});
