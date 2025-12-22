import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface PostTourTeamListProps {
    teams: any[];
    userTeamId?: number;
}

export default function PostTourTeamList({ teams, userTeamId }: PostTourTeamListProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.teamList}>
            {teams.filter(team => team.id !== userTeamId).map((team) => {
                const isFinished = !!team.finishedAt;
                const statusColor = team.color;

                return (
                    <View key={team.id} style={[styles.teamCard, { backgroundColor: theme.bgSecondary }]}>
                        <View style={styles.statusIconContainer}>
                            {isFinished ? (
                                <View style={[styles.statusIconCircle, { backgroundColor: statusColor + '33' }]}>
                                    <Ionicons name="checkmark" size={16} color={statusColor} />
                                </View>
                            ) : (
                                <View style={[styles.statusIconCircle, { backgroundColor: statusColor + '33' }]}>
                                    <ActivityIndicator size="small" color={statusColor} />
                                </View>
                            )}
                        </View>

                        <View style={styles.teamInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.teamEmoji}>{team.emoji}</Text>
                                <Text style={[styles.teamName, { color: theme.textPrimary }]}>{team.name}</Text>
                            </View>
                            <Text style={[styles.teamStatusText, { color: isFinished ? statusColor : theme.textSecondary }]}>
                                {isFinished ? t('finished') : t('inProgress')}
                            </Text>
                        </View>
                    </View>
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
    teamCard: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIconContainer: {
        marginRight: 16,
    },
    statusIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
    },
    teamEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    teamStatusText: {
        fontSize: 12,
    },
});
