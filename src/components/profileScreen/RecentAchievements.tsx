import { useLanguage } from '@/src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface RecentAchievementsProps {
    achievements: Achievement[];
}

export default function RecentAchievements({ achievements }: RecentAchievementsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: theme.textPrimary }]}>{t('recentAchievements')}</Text>

            {achievements.map((achievement) => (
                <View key={achievement.id} style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                    <View style={[styles.iconContainer, { backgroundColor: achievement.color + '20' }]}>
                        <Ionicons name={achievement.icon} size={24} color={achievement.color} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>{achievement.title}</Text>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>{achievement.description}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
});
