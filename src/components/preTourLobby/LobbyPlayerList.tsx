import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface LobbyPlayerListProps {
    activeTour: any;
    currentUserId: number;
}

export const LobbyPlayerList: React.FC<LobbyPlayerListProps> = ({ activeTour, currentUserId }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const otherTeams = activeTour?.teams?.filter((t: any) => t.userId !== currentUserId) || [];

    return (
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.playersSection}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                {t('otherTeams')} ({otherTeams.length})
            </Text>

            {otherTeams.map((team: any, index: number) => (
                <Animated.View
                    key={team.id}
                    entering={FadeInDown.delay(300 + (index * 100))}
                    style={[styles.playerRow, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}
                >
                    <LinearGradient
                        colors={[theme.bgTertiary, theme.bgTertiary]}
                        style={styles.avatarContainer}
                    >
                        <Text style={styles.avatarEmoji}>{team.emoji || "👤"}</Text>
                    </LinearGradient>

                    <View style={styles.playerInfo}>
                        <Text style={[styles.playerName, { color: theme.textPrimary }]}>
                            {team.name || team.user.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {team.user.id === activeTour.userId && (
                                <View style={[styles.roleBadge, { backgroundColor: theme.warning + '20' }]}>
                                    <Text style={[styles.roleText, { color: theme.warning }]}>{t('host')}</Text>
                                </View>
                            )}
                            <Text style={[styles.playerRole, { color: theme.textSecondary }]}>
                                {team.user.id === activeTour.userId ? "" : t('ready')}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            ))}
            {otherTeams.length === 0 && (
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 12, fontStyle: 'italic' }}>
                    {t('waitingForJoin')}
                </Text>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    playersSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1.5,
        opacity: 0.6,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
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
    avatarEmoji: {
        fontSize: 26,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    playerRole: {
        fontSize: 13,
        fontWeight: '500',
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 8,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
});
