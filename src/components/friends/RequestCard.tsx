import { GenericCard } from '@/src/components/common/GenericCard';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface RequestCardProps {
    request: any;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}

const RequestCardComponent = ({ request, onAccept, onDecline }: RequestCardProps) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

    console.log('[RequestCard] rendering request:', JSON.stringify(request));

    const requester = request.fromUser || request.requester || request;
    const avatarUri = requester?.avatarUrl || requester?.avatar;
    const name = requester?.name || requester?.username || (requester?.email ? requester.email.split('@')[0] : null) || request.name || 'Unknown User';
    const level = requester?.level || 1;

    const navigateToProfile = () => {
        if (requester?.id) {
            router.push({
                pathname: '/profile/friend-profile',
                params: { userId: requester.id }
            });
        }
    };

    return (
        <GenericCard style={{ marginBottom: 8 }} padding="small">
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TouchableOpacity onPress={navigateToProfile} style={styles.userInfo} activeOpacity={0.7}>
                    <Image
                        source={avatarUri ? { uri: getOptimizedImageUrl(avatarUri, 100) } : require('../../../assets/images/profilePictureFallback.png')}
                        style={styles.avatar}
                        contentFit="cover"
                        cachePolicy="disk"
                        transition={200}
                        placeholder={require('../../../assets/images/profilePictureFallback.png')}
                    />
                    <View style={styles.textContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <TextComponent style={styles.name} color={theme.textPrimary} bold variant="body">
                                {name}
                            </TextComponent>
                            <View style={[styles.badge, { backgroundColor: theme.bgSecondary }]}>
                                <TextComponent style={styles.badgeText} color={theme.primary} bold variant="caption">
                                    Lvl {level}
                                </TextComponent>
                            </View>
                        </View>
                        <TextComponent style={[styles.subText, { marginTop: 2 }]} color={theme.textSecondary} variant="caption">
                            {t('wantsToBeFriend')}
                        </TextComponent>
                    </View>
                </TouchableOpacity>

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
        </GenericCard>
    );
}

export const RequestCard = React.memo(RequestCardComponent);

// Fixed styling (using View instead of div, assuming React Native)
const styles = StyleSheet.create({
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
