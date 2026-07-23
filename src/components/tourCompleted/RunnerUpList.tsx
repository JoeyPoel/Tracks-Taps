import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TextComponent } from '../common/TextComponent';
import { getPubGolfStats } from '../../utils/pubGolfUtils';

interface RunnerUpListProps {
    runnerUps: any[];
    isPubGolf: boolean;
    stops: any[];
    theme: any;
    t: (key: any) => string;
}

export const RunnerUpList: React.FC<RunnerUpListProps> = ({
    runnerUps,
    isPubGolf,
    stops,
    theme,
    t
}) => {
    if (runnerUps.length === 0) return null;

    return (
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.runnerUpSection}>
            <TextComponent style={styles.sectionTitle} color={theme.textSecondary} bold variant="caption">
                {t('leaderboard')}
            </TextComponent>
            {runnerUps.map((team, index) => (
                <View key={team.id} style={[styles.runnerUpRow, { borderColor: theme.borderPrimary }]}>
                    <TextComponent style={styles.runnerUpRank} color={theme.textSecondary} bold variant="body">
                        {index + 4}
                    </TextComponent>
                    <TextComponent style={styles.runnerUpName} color={theme.textPrimary} bold variant="body">
                        {team.name || team.user?.name}
                    </TextComponent>
                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="flash" size={12} color={theme.primary} />
                            <TextComponent style={styles.runnerUpScore} color={theme.textPrimary} bold variant="body">
                                {team.score} PTS
                            </TextComponent>
                        </View>
                        {isPubGolf && (() => {
                            const stats = getPubGolfStats(stops, team.pubGolfStops, team.pubGolfPenalties);
                            const sips = stats.totalSips;
                            return (
                                <View style={[styles.pgBadge, { backgroundColor: theme.bgSecondary, marginTop: 2 }]}>
                                    <Ionicons name="beer-outline" size={10} color={theme.pubgolfColor} />
                                    <TextComponent style={{ color: theme.pubgolfColor, fontWeight: '800', fontSize: 10 }} variant="caption">
                                        {sips} {t('sips').toUpperCase()}
                                    </TextComponent>
                                </View>
                            );
                        })()}
                    </View>
                </View>
            ))}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    runnerUpSection: {
        width: '100%',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    runnerUpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    runnerUpRank: {
        width: 30,
        fontSize: 16,
        fontWeight: 'bold',
    },
    runnerUpName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    runnerUpScore: {
        fontSize: 14,
        fontWeight: '600',
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
