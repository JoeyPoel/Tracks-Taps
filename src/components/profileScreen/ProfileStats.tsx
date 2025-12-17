import { useLanguage } from '@/src/context/LanguageContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BoltIcon, MapPinIcon, UserPlusIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';

interface ProfileStatsProps {
    toursDone: number;
    totalPoints: number;
    friends: number;
}

export default function ProfileStats({ toursDone, totalPoints, friends }: ProfileStatsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}>
                <MapPinIcon size={24} color={theme.secondary} style={styles.icon} />
                <Text style={[styles.value, { color: theme.textPrimary }]}>{toursDone}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('toursDone')}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}>
                <BoltIcon size={24} color={theme.warning} style={styles.icon} />
                <Text style={[styles.value, { color: theme.textPrimary }]}>{totalPoints}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('totalPoints')}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}>
                <UserPlusIcon size={24} color={theme.primary} style={styles.icon} />
                <Text style={[styles.value, { color: theme.textPrimary }]}>{friends}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('friends')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 8,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
    },
});
