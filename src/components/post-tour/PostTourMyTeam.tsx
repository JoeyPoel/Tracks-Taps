import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getPubGolfStats } from '@/src/utils/pubGolfUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PostTourMyTeamProps {
    userTeam: any;
    isPubGolf?: boolean;
    stops?: any[];
}

export default function PostTourMyTeam({ userTeam, isPubGolf, stops }: PostTourMyTeamProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    if (!userTeam) return null;

    const isFinished = !!userTeam.finishedAt;

    return (
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.container}>
            <TextComponent style={styles.sectionLabel} color={theme.textSecondary} bold variant="label">
                {t('myTeam')}
            </TextComponent>
            
            <View
                style={[
                    styles.teamCard,
                    {
                        backgroundColor: theme.bgSecondary,
                        borderColor: userTeam.color || theme.borderPrimary,
                        borderWidth: userTeam.color ? 2 : 1
                    }
                ]}
            >
                <LinearGradient
                    colors={userTeam.color ? [theme.bgTertiary, userTeam.color + '40'] : [theme.bgTertiary, theme.bgTertiary]}
                    style={[styles.avatarContainer, userTeam.color ? { borderColor: userTeam.color, borderWidth: 1 } : null]}
                >
                    <TextComponent style={styles.avatarEmoji} size={26}>{userTeam.emoji || "👤"}</TextComponent>
                </LinearGradient>

                <View style={styles.teamInfo}>
                    <TextComponent style={styles.teamName} color={userTeam.color || theme.textPrimary} bold variant="body">
                        {userTeam.name}
                    </TextComponent>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextComponent style={styles.teamStatusText} color={isFinished ? theme.success : theme.textSecondary} variant="caption">
                            {isFinished ? t('finished') : t('walking')}...
                        </TextComponent>
                        {isPubGolf && (() => {
                            const stats = getPubGolfStats(stops, userTeam.pubGolfStops);
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
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1.5,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
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
        lineHeight: 32,
    },
    teamInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    teamName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    teamStatusText: {
        fontSize: 13,
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
