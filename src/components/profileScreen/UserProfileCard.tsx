import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface UserProfileCardProps {
    name: string;
    level: number;
    levelProgress: number;
    avatarUrl?: string;
    points: number;
    completedTours: number;
    createdTours: number;
    onEditPress?: () => void;
}

export default function UserProfileCard({
    name,
    level,
    levelProgress,
    avatarUrl,
    points,
    completedTours,
    createdTours,
    onEditPress,
}: UserProfileCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={['rgba(100, 120, 200, 0.3)', 'rgba(80, 60, 120, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.bgTertiary }]}>
                                    <Ionicons name="person" size={48} color={theme.iconMuted} />
                                </View>
                            )}
                            {onEditPress && (
                                <TouchableOpacity
                                    style={[styles.editButton, { backgroundColor: theme.primary }]}
                                    onPress={onEditPress}
                                >
                                    <Ionicons name="pencil" size={16} color={theme.fixedWhite} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>
                            <View style={styles.levelBadge}>
                                <View style={[styles.levelTag, { backgroundColor: theme.warning }]}>
                                    <Text style={[styles.levelText, { color: theme.fixedWhite }]}>
                                        {t('level')} {level}
                                    </Text>
                                </View>
                                <Text style={[styles.explorerText, { color: theme.textSecondary }]}>
                                    {t('explorer')}
                                </Text>
                            </View>

                            <View style={styles.progressContainer}>
                                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                                    {t('levelProgress')}
                                </Text>
                                <Text style={[styles.progressValue, { color: theme.textPrimary }]}>
                                    {levelProgress}%
                                </Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        { backgroundColor: theme.primary, width: `${levelProgress}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="flash" size={24} color={theme.primary} />
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                {t('points')}
                            </Text>
                            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{points}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                {t('completed')}
                            </Text>
                            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completedTours}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Ionicons name="create" size={24} color={theme.warning} />
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                {t('created')}
                            </Text>
                            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{createdTours}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
        borderRadius: 16,
    },
    card: {
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    levelTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    explorerText: {
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
