import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BoltIcon } from 'react-native-heroicons/solid';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn, FadeIn } from 'react-native-reanimated';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { ScoreDetails } from '../../../utils/pubGolfUtils';

interface PubGolfResultFooterProps {
    scoreDetails: ScoreDetails;
    diffText: string;
    isNewlySaved?: boolean;
    onReset?: () => void;
}

export default function PubGolfResultFooter({
    scoreDetails,
    diffText,
    isNewlySaved = false,
    onReset,
}: PubGolfResultFooterProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const getAnimation = () => {
        const key = scoreDetails.colorKey;
        if (['holeInOne', 'albatross', 'eagle'].includes(key)) {
            return BounceIn.duration(800).springify().damping(12);
        }
        if (['birdie', 'par'].includes(key)) {
            return FadeInDown.duration(600).springify().damping(15);
        }
        return FadeIn.duration(400);
    };

    return (
        <Animated.View 
            entering={isNewlySaved ? getAnimation() : undefined}
            style={[styles.resultFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}
        >
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
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
            {onReset && (
                <TouchableOpacity 
                    onPress={onReset} 
                    style={styles.resetButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="refresh-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    resultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        justifyContent: 'flex-start',
        marginTop: 2,
    },
    xpText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    resetButton: {
        padding: 4,
    }
});
