import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextComponent } from '../common/TextComponent';
import { adminStyles as styles } from './adminStyles';
import { StatsData } from '../../hooks/useAdminState';
import { useLanguage } from '../../context/LanguageContext';

interface StatsTabProps {
    adminState: {
        theme: any;
        stats: StatsData | null;
        loadingStats: boolean;
    };
}

export function StatsTab({ adminState }: StatsTabProps) {
    const { theme, stats, loadingStats } = adminState;
    const { t } = useLanguage();

    return (
        <View style={styles.sectionContainer}>
            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                {t('systemStatistics')}
            </TextComponent>

            {loadingStats ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : stats ? (
                <>
                    {/* System Stats Cards Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                            <Ionicons name="people-outline" size={24} color={theme.primary} />
                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                {stats.users}
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary}>
                                {t('totalRegisteredUsers')}
                            </TextComponent>
                        </View>

                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                            <Ionicons name="map-outline" size={24} color={theme.accent} />
                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                {stats.tours}
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary}>
                                {t('totalToursCreated')}
                            </TextComponent>
                        </View>

                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                            <Ionicons name="game-controller-outline" size={24} color="#10b981" />
                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                {stats.activeSessions}
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary}>
                                {t('activeSessionsPlay')}
                            </TextComponent>
                        </View>

                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                            <Ionicons name="ticket-outline" size={24} color="#f59e0b" />
                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                {stats.tokensPurchased}
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary}>
                                {t('inAppTokensPurchased')}
                            </TextComponent>
                        </View>
                    </View>

                    <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                        {t('tourModerationBreakdown')}
                    </TextComponent>

                    {/* Tour Status Breakdown Card */}
                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        {[
                            { label: t('publishedActive'), value: stats.tourStatusCounts.PUBLISHED, color: 'green', icon: 'checkmark-circle-outline' },
                            { label: t('pendingReview'), value: stats.tourStatusCounts.PENDING_REVIEW, color: theme.accent, icon: 'time-outline' },
                            { label: t('draft'), value: stats.tourStatusCounts.DRAFT, color: theme.textSecondary, icon: 'create-outline' },
                            { label: t('rejected'), value: stats.tourStatusCounts.REJECTED, color: theme.danger, icon: 'close-circle-outline' },
                        ].map((item, idx) => (
                            <View key={item.label} style={[styles.statusRow, idx < 3 && { borderBottomColor: theme.borderPrimary, borderBottomWidth: 1 }]}>
                                <View style={styles.statusRowLeft}>
                                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                                    <TextComponent variant="body" color={theme.textPrimary} style={{ marginLeft: 10 }}>
                                        {item.label}
                                    </TextComponent>
                                </View>
                                <TextComponent variant="body" bold color={theme.textPrimary}>
                                    {item.value}
                                </TextComponent>
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.centerContainer}>
                    <TextComponent variant="body" color={theme.textSecondary}>{t('noStatsLoaded')}</TextComponent>
                </View>
            )}
        </View>
    );
}
