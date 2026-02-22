import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPubGolfStats } from '@/src/utils/pubGolfUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PostTourTeamListProps {
    teams: any[];
    userTeamId?: number;
    isPubGolf?: boolean;
    stops?: any[];
}

export default function PostTourTeamList({ teams, userTeamId, isPubGolf, stops }: PostTourTeamListProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const otherTeams = teams.filter(team => team.id !== userTeamId);

    if (otherTeams.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <TextComponent style={styles.emptyText} color={theme.textSecondary} variant="body">
                    {t('noOtherTeams')}
                </TextComponent>
            </View>
        );
    }

    return (
        <View style={styles.teamList}>
            <TextComponent style={styles.sectionTitle} color={theme.textPrimary} bold variant="label">
                {t('otherTeams')}
            </TextComponent>

            {otherTeams.map((team, index) => {
                const isFinished = !!team.finishedAt;
                const statusColor = team.color;

                return (
                    <Animated.View
                        key={team.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                        style={[styles.teamCard, { backgroundColor: theme.bgSecondary }]}
                    >
                        {/* Avatar */}
                        <View style={[styles.avatarContainer, { backgroundColor: theme.bgPrimary }]}>
                            <TextComponent style={styles.teamEmoji} size={24}>{team.emoji}</TextComponent>
                        </View>

                        <View style={styles.teamInfo}>
                            <TextComponent style={styles.teamName} color={theme.textPrimary} bold variant="body">
                                {team.name}
                            </TextComponent>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextComponent style={styles.teamStatusText} color={isFinished ? theme.success : theme.textSecondary} variant="caption">
                                    {isFinished ? t('finished') : t('walking')}...
                                </TextComponent>
                                {isPubGolf && (() => {
                                    const stats = getPubGolfStats(stops, team.pubGolfStops);
                                    const score = stats.currentScore;
                                    const pgText = score === 0 ? 'E PG' : score > 0 ? `+${score} PG` : `${score} PG`;
                                    return (
                                        <TextComponent style={[styles.teamStatusText, { color: theme.textSecondary, marginLeft: 8 }]} variant="caption">
                                            {pgText}
                                        </TextComponent>
                                    );
                                })()}
                            </View>
                        </View>

                        {/* Status Indicator */}
                        <View style={styles.statusIconContainer}>
                            {isFinished ? (
                                <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
                                    <Ionicons name="flag" size={14} color={theme.success} />
                                    <TextComponent style={styles.statusText} color={theme.success} bold variant="caption">
                                        {t('done')}
                                    </TextComponent>
                                </View>
                            ) : (
                                <View style={[styles.statusBadge, { backgroundColor: theme.warning + '20' }]}>
                                    <ActivityIndicator size="small" color={theme.warning} style={{ transform: [{ scale: 0.7 }] }} />
                                    <TextComponent style={styles.statusText} color={theme.warning} bold variant="caption">
                                        {t('active')}
                                    </TextComponent>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    teamList: {
        gap: 12,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontStyle: 'italic',
    },
    teamCard: {
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    teamEmoji: {
        fontSize: 24,
    },
    teamInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    teamName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    teamStatusText: {
        fontSize: 12,
    },
    statusIconContainer: {
        marginLeft: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
