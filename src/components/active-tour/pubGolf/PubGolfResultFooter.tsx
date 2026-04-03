import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BoltIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInDown, BounceIn, FadeIn, ZoomInEasyUp } from 'react-native-reanimated';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { ScoreDetails } from '../../../utils/pubGolfUtils';

interface PubGolfResultFooterProps {
    scoreDetails: ScoreDetails;
    diffText: string;
    isNewlySaved?: boolean;
}

export default function PubGolfResultFooter({
    scoreDetails,
    diffText,
    isNewlySaved = false,
}: PubGolfResultFooterProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const getAnimation = () => {
        const key = scoreDetails.colorKey;
        // Premium scores get more excitement
        if (['holeInOne', 'albatross', 'eagle'].includes(key)) {
            return BounceIn.duration(800).springify().damping(12);
        }
        // Good scores get a nice slide up
        if (['birdie', 'par'].includes(key)) {
            return FadeInDown.duration(600).springify().damping(15);
        }
        // Over par gets a simple entry
        return FadeIn.duration(400);
    };

    return (
        <Animated.View 
            entering={isNewlySaved ? getAnimation() : undefined}
            style={[styles.resultFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}
        >
            <View>
                <Text style={[styles.resultText, { color: theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf][0] }]}>
                    {t(scoreDetails.nameKey as any)} <Text style={{ color: theme.textSecondary, fontWeight: 'normal' }}>{t(scoreDetails.subKey as any)}</Text> {diffText}
                </Text>
                {scoreDetails.recommendedXP > 0 && (
                    <View style={styles.xpContainer}>
                        <BoltIcon size={14} color={theme.gold} />
                        <Text style={[styles.xpText, { color: theme.gold }]}>
                            +{scoreDetails.recommendedXP} {t('xp')}
                        </Text>
                    </View>
                )}
            </View>
        </Animated.View>
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
