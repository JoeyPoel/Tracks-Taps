import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPubGolfStats } from '@/src/utils/pubGolfUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
                        style={[
                            styles.teamCard,
                            {
                                backgroundColor: theme.bgSecondary,
                                borderColor: team.color || theme.borderPrimary,
                                borderWidth: team.color ? 2 : 1
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={team.color ? [theme.bgTertiary, team.color + '40'] : [theme.bgTertiary, theme.bgTertiary]}
                            style={[styles.avatarContainer, team.color ? { borderColor: team.color, borderWidth: 1 } : null]}
                        >
                            <TextComponent style={styles.teamEmoji} size={26}>{team.emoji || "👤"}</TextComponent>
                        </LinearGradient>

                        <View style={styles.teamInfo}>
                            <TextComponent style={styles.teamName} color={team.color || theme.textPrimary} bold variant="body">
                                {team.name}
                            </TextComponent>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextComponent style={styles.teamStatusText} color={isFinished ? theme.success : theme.textSecondary} variant="caption">
                                    {isFinished ? t('finished') : t('walking')}...
                                </TextComponent>
                                {isPubGolf && (() => {
                                    const stats = getPubGolfStats(stops, team.pubGolfStops);
                                    const sips = stats.totalSips;
                                    return (
                                        <TextComponent style={[styles.teamStatusText, { color: theme.textSecondary, marginLeft: 8 }]} variant="caption">
                                            {sips} {t('sips').toUpperCase()}
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    teamEmoji: {
        fontSize: 26,
        lineHeight: 32,
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
