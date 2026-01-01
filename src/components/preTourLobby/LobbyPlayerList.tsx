import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
            <TextComponent style={styles.sectionLabel} color={theme.textSecondary} bold variant="label">
                {t('otherTeams')} ({otherTeams.length})
            </TextComponent>

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
                        <TextComponent style={styles.avatarEmoji} size={26}>{team.emoji || "👤"}</TextComponent>
                    </LinearGradient>

                    <View style={styles.playerInfo}>
                        <TextComponent style={styles.playerName} color={theme.textPrimary} bold variant="body">
                            {team.name || team.user.name}
                        </TextComponent>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {team.user.id === activeTour.userId && (
                                <View style={[styles.roleBadge, { backgroundColor: theme.warning + '20' }]}>
                                    <TextComponent style={styles.roleText} color={theme.warning} bold variant="caption">
                                        {t('host')}
                                    </TextComponent>
                                </View>
                            )}
                            <TextComponent style={styles.playerRole} color={theme.textSecondary} variant="caption">
                                {team.user.id === activeTour.userId ? "" : t('ready')}
                            </TextComponent>
                        </View>
                    </View>
                </Animated.View>
            ))}
            {otherTeams.length === 0 && (
                <TextComponent color={theme.textSecondary} style={{ marginTop: 12, fontStyle: 'italic' }} center variant="body">
                    {t('waitingForJoin')}
                </TextComponent>
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
