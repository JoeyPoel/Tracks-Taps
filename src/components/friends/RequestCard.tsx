import { GenericCard } from '@/src/components/common/GenericCard';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
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
                    <View style={styles.headerRow}>
                        <TextComponent style={styles.name} color={theme.textPrimary} bold variant="body">
                            {request.requester.name}
                        </TextComponent>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => onAccept(request.id)}
                                style={[styles.iconButton, { backgroundColor: theme.primary }]}
                            >
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onDecline(request.id)}
                                style={[styles.iconButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.borderPrimary }]}
                            >
                                <Ionicons name="close" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <View style={[styles.badge, { backgroundColor: theme.bgSecondary }]}>
                            <TextComponent style={styles.badgeText} color={theme.primary} bold variant="caption">
                                Lvl {request.requester.level || 1}
                            </TextComponent>
                        </View>
                        <TextComponent style={styles.subText} color={theme.textSecondary} variant="caption">
                            {t('wantsToBeFriend')}
                        </TextComponent>
                    </View>
                </View>
            </View>
        </GenericCard>
    );
}

// Fixed styling (using View instead of div, assuming React Native)
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flex: 1,
        gap: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
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
        gap: 6,
    },
    iconButton: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
});
