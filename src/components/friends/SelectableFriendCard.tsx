import { GenericCard } from '@/src/components/common/GenericCard';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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
                <Image
                    source={friend.avatarUrl ? { uri: getOptimizedImageUrl(friend.avatarUrl, 100) } : require('../../../assets/images/Mascott.png')}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="disk"
                />
                <View style={{ flex: 1 }}>
                    <TextComponent style={styles.name} color={theme.textPrimary} bold variant="body">
                        {friend.name}
                    </TextComponent>
                    <TextComponent style={styles.subText} color={theme.textSecondary} variant="caption">
                        {t('levelShort')} {friend.level}
                    </TextComponent>
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
