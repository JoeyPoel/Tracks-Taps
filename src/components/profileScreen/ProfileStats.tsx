import { useLanguage } from '@/src/context/LanguageContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPinIcon, PencilSquareIcon, UsersIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';

interface ProfileStatsProps {
    toursDone: number;
    toursCreated: number;
    friends: number;
    onPressToursDone?: () => void;
    onPressToursCreated?: () => void;
    onPressFriends?: () => void;
}

export default function ProfileStats({
    toursDone,
    toursCreated,
    friends,
    onPressToursDone,
    onPressToursCreated,
    onPressFriends
}: ProfileStatsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}
                onPress={onPressToursDone}
                activeOpacity={0.7}
            >
                <MapPinIcon size={24} color={theme.secondary} style={styles.icon} />
                <Text style={[styles.value, { color: theme.textPrimary }]}>{toursDone}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('toursDone')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}
                onPress={onPressToursCreated}
                activeOpacity={0.7}
            >
                <PencilSquareIcon size={24} color={theme.warning} style={styles.icon} />
                <Text style={[styles.value, { color: theme.textPrimary }]}>{toursCreated}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('toursCreated')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}
                onPress={onPressFriends}
                activeOpacity={0.7}
            >
                <UsersIcon size={24} color={theme.primary} style={styles.icon} />
                <Text style={[styles.value, { color: theme.textPrimary }]}>{friends}</Text>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('friends')}</Text>
            </TouchableOpacity>
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
        textAlign: 'center',
    },
});
