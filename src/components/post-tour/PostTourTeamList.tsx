import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PostTourTeamListProps {
    teams: any[];
    userTeamId?: number;
}

export default function PostTourTeamList({ teams, userTeamId }: PostTourTeamListProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const otherTeams = teams.filter(team => team.id !== userTeamId);

    if (otherTeams.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('noOtherTeams')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.teamList}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('otherTeams')}</Text>

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
                            <Text style={styles.teamEmoji}>{team.emoji}</Text>
                        </View>

                        <View style={styles.teamInfo}>
                            <Text style={[styles.teamName, { color: theme.textPrimary }]}>{team.name}</Text>
                            <Text style={[styles.teamStatusText, { color: isFinished ? theme.success : theme.textSecondary }]}>
                                {isFinished ? t('finished') : t('walking')}...
                            </Text>
                        </View>

                        {/* Status Indicator */}
                        <View style={styles.statusIconContainer}>
                            {isFinished ? (
                                <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
                                    <Ionicons name="flag" size={14} color={theme.success} />
                                    <Text style={[styles.statusText, { color: theme.success }]}>{t('done')}</Text>
                                </View>
                            ) : (
                                <View style={[styles.statusBadge, { backgroundColor: theme.warning + '20' }]}>
                                    <ActivityIndicator size="small" color={theme.warning} style={{ transform: [{ scale: 0.7 }] }} />
                                    <Text style={[styles.statusText, { color: theme.warning }]}>{t('active')}</Text>
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
