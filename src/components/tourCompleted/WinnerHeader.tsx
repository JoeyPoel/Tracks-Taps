import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { TextComponent } from '../common/TextComponent';
import { getPubGolfStats } from '../../utils/pubGolfUtils';

interface WinnerHeaderProps {
    winnerName: string;
    score: number;
    isPubGolf: boolean;
    stops: any[];
    pubGolfStops: any[];
    pubGolfPenalties: any[];
    theme: any;
    t: (key: any) => string;
    rankingMode: 'pubgolf' | 'xp';
    winnerId: string | number;
}

export const WinnerHeader: React.FC<WinnerHeaderProps> = ({
    winnerName,
    score,
    isPubGolf,
    stops,
    pubGolfStops,
    pubGolfPenalties,
    theme,
    t,
    rankingMode,
    winnerId
}) => {
    return (
        <Animated.View
            key={`${rankingMode}_${winnerId}`}
            entering={ZoomIn.springify().damping(12)}
            style={styles.winnerHeader}
        >
            <View style={{ alignItems: 'center' }}>
                <TextComponent style={styles.winnerText} color={theme.textPrimary} bold variant="h1" center>
                    {winnerName}
                </TextComponent>
            </View>
            <View style={[styles.winnerScorePill, { backgroundColor: theme.bgSecondary }]}>
                <View style={styles.scoreItem}>
                    <Ionicons name="flash" size={14} color={theme.primary} />
                    <TextComponent style={styles.winnerScoreText} color={theme.primary} bold variant="caption">
                        {score || 0} PTS
                    </TextComponent>
                </View>

                {isPubGolf && (
                    (() => {
                        const stats = getPubGolfStats(stops, pubGolfStops, pubGolfPenalties);
                        const sips = stats.totalSips;
                        return (
                            <>
                                <View style={{ width: 1, height: 12, backgroundColor: theme.borderPrimary, marginHorizontal: 4 }} />
                                <View style={[styles.pgBadge, { backgroundColor: theme.bgSecondary }]}>
                                    <Ionicons name="beer-outline" size={12} color={theme.pubgolfColor} />
                                    <TextComponent style={[styles.winnerScoreText, { color: theme.pubgolfColor }]} bold variant="caption">
                                        {sips} {t('sips').toUpperCase()}
                                    </TextComponent>
                                </View>
                            </>
                        );
                    })()
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    winnerHeader: {
        alignItems: 'center',
    },
    winnerText: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: 8,
        lineHeight: 44,
        paddingTop: 10,
    },
    winnerScorePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    winnerScoreText: {
        fontWeight: '800',
        fontSize: 14,
    },
    scoreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pgBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    }
});
