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
    onEditPress?: () => void;
}

export default function UserProfileCard({
    name,
    level,
    levelProgress,
    avatarUrl,
    onEditPress,
}: UserProfileCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={[theme.bgSecondary, theme.bgTertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.bgTertiary }]}>
                                    <Ionicons name="person" size={40} color={theme.iconMuted} />
                                </View>
                            )}
                            {onEditPress && (
                                <TouchableOpacity
                                    style={[styles.editButton, { backgroundColor: theme.primary }]}
                                    onPress={onEditPress}
                                >
                                    <Ionicons name="pencil" size={14} color={theme.fixedWhite} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>

                        <View style={styles.levelRow}>
                            <View style={[styles.levelBadge, { backgroundColor: theme.warning }]}>
                                <Text style={[styles.levelText, { color: theme.fixedBlack }]}>Level {level}</Text>
                            </View>
                            <Text style={[styles.rankText, { color: theme.textSecondary }]}>Explorer</Text>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressLabels}>
                                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Next level</Text>
                                <Text style={[styles.progressValue, { color: theme.textPrimary }]}>560 / 1000 XP</Text>
                            </View>
                            <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                <LinearGradient
                                    colors={[theme.warning, theme.danger]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressBarFill, { width: '56%' }]}
                                />
                            </View>
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
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradient: {
        padding: 20,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSection: {
        marginRight: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E1E2E', // Matches dark bg
    },
    infoSection: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    levelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    rankText: {
        fontSize: 14,
    },
    progressSection: {
        width: '100%',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});
