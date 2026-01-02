import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
            <TextComponent style={styles.value} color={theme.textPrimary} bold variant="h2">{value}</TextComponent>
            <TextComponent style={styles.label} color={theme.textSecondary} variant="caption">{label}</TextComponent>
        </TouchableOpacity>
    );

    const Divider = () => <View style={[styles.divider, { backgroundColor: theme.borderSecondary }]} />;

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <StatItem
                value={toursDone}
                label={t('toursDone')}
                onPress={onPressToursDone}
            />
            <Divider />
            <StatItem
                value={toursCreated}
                label={t('toursCreated')}
                onPress={onPressToursCreated}
            />
            <Divider />
            <StatItem
                value={friends}
                label={t('friends')}
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
        paddingVertical: 20,
        borderRadius: 16,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
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
        height: 32,
    }
});
