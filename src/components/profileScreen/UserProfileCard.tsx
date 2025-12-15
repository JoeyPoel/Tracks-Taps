import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PencilIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface UserProfileCardProps {
    name: string;
    level: number;
    currentXP: number;
    maxXP: number;
    avatarUrl?: string;
    onEditPress?: () => void;
}

export default function UserProfileCard({
    name,
    level,
    currentXP,
    maxXP,
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
                            <Image
                                source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/images/Mascott.png')}
                                style={[styles.avatar, { borderColor: theme.borderPrimary }]}
                            />
                            {onEditPress && (
                                <TouchableOpacity
                                    style={[styles.editButton, { backgroundColor: theme.primary, borderColor: theme.bgSecondary }]}
                                    onPress={onEditPress}
                                >
                                    <PencilIcon size={14} color={theme.fixedWhite} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>

                        <View style={styles.levelRow}>
                            <View style={[styles.levelBadge, { backgroundColor: theme.warning }]}>
                                <Text style={[styles.levelText, { color: theme.fixedWhite }]}>{t('level')} {level}</Text>
                            </View>
                            <Text style={[styles.rankText, { color: theme.textSecondary }]}>{t('explorer')}</Text>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressLabels}>
                                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>{t('nextLevel')}</Text>
                                <Text style={[styles.progressValue, { color: theme.textPrimary }]}>{currentXP} / {maxXP} XP</Text>
                            </View>
                            <View style={[styles.progressBarBg, { backgroundColor: theme.borderPrimary }]}>
                                <LinearGradient
                                    colors={[theme.fixedGradientFromLevel, theme.fixedGradientToLevel]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressBarFill, { width: `${(currentXP / maxXP) * 100}%` }]}
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
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
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
