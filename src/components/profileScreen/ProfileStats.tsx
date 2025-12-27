import { useLanguage } from '@/src/context/LanguageContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const StatItem = ({ label, value, onPress }: any) => (
        <TouchableOpacity
            style={styles.statItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
    );

    const Divider = () => <View style={[styles.divider, { backgroundColor: theme.borderSecondary }]} />;

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <StatItem
                value={toursDone}
                label={t('toursDone') || 'Tours Done'}
                onPress={onPressToursDone}
            />
            <Divider />
            <StatItem
                value={toursCreated}
                label={t('toursCreated') || 'Created'}
                onPress={onPressToursCreated}
            />
            <Divider />
            <StatItem
                value={friends}
                label={t('friends') || 'Friends'}
                onPress={onPressFriends}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 16,
        borderRadius: 16,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 24,
    }
});
