import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface RequestCardProps {
    request: any;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}

import { GenericCard } from '@/src/components/common/GenericCard';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import

export function RequestCard({ request, onAccept, onDecline }: RequestCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <GenericCard style={styles.container} padding="small">
            <View style={styles.userInfo}>
                <Image
                    source={request.requester.avatarUrl ? { uri: getOptimizedImageUrl(request.requester.avatarUrl, 100) } : require('../../../assets/images/profilePictureFallback.png')}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="disk"
                />
                <View style={styles.textContainer}>
                    <TextComponent style={styles.name} color={theme.textPrimary} bold variant="body">
                        {request.requester.name}
                    </TextComponent>
                    <TextComponent style={styles.subText} color={theme.textSecondary} variant="caption">
                        {t('wantsToBeFriend')}
                    </TextComponent>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => onAccept(request.id)}
                    style={[styles.iconButton, { backgroundColor: theme.primary }]}
                >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onDecline(request.id)}
                    style={[styles.iconButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.borderPrimary }]}
                >
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>
        </GenericCard>
    );
}

// Fixed styling (using View instead of div, assuming React Native)
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
    },
    textContainer: {
        gap: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
    },
    subText: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
