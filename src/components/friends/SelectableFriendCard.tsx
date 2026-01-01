import { GenericCard } from '@/src/components/common/GenericCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface SelectableFriendCardProps {
    friend: any;
    isSelected: boolean;
    onToggle: (id: number) => void;
}

export function SelectableFriendCard({ friend, isSelected, onToggle }: SelectableFriendCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <GenericCard
            onPress={() => onToggle(friend.id)}
            variant={isSelected ? 'gradient' : 'flat'}
            gradientColors={isSelected ? [theme.primary + '20', theme.secondary + '10'] : undefined}
            style={[
                styles.itemCard,
                {
                    borderColor: isSelected ? theme.primary : 'transparent',
                    borderWidth: 2,
                }
            ]}
            padding="medium"
        >
            <View style={styles.innerContainer}>
                <Image source={friend.avatarUrl ? { uri: friend.avatarUrl } : require('../../../assets/images/Mascott.png')} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{friend.name}</Text>
                    <Text style={[styles.subText, { color: theme.textSecondary }]}>{t('levelShort')} {friend.level}</Text>
                </View>
                <View style={[
                    styles.checkbox,
                    { borderColor: isSelected ? theme.primary : theme.textSecondary },
                    isSelected && { backgroundColor: theme.primary }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
            </View>
        </GenericCard>
    );
}

const styles = StyleSheet.create({
    itemCard: {
        marginBottom: 8,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 18,
        marginRight: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    subText: {
        fontSize: 13,
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
});
