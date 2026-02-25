import { FadeInItem } from '@/src/components/common/FadeInList';
import { ScreenHeader } from '@/src/components/common/ScreenHeader';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { TextComponent } from '@/src/components/common/TextComponent';
import { FriendCard } from '@/src/components/friends/FriendCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { friendService } from '@/src/services/friendsService';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

export default function UserFriendsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const { userId, userName } = useLocalSearchParams();
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFriends = useCallback(async () => {
        setLoading(true);
        try {
            const data = await friendService.getFriends(1, 50, Number(userId));
            setFriends(data.data || []);
        } catch (error) {
            console.error('Error loading user friends:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            loadFriends();
        }
    }, [userId, loadFriends]);

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <FadeInItem index={index}>
            <FriendCard
                friend={item}
                onPress={() => router.push({ pathname: '/profile/friend-profile', params: { userId: item.id } })}
            />
        </FadeInItem>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} withScrollView={false} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader
                showBackButton
                title={userName ? `${userName}'s ${t('friends')}` : t('friends')}
            />

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={friends}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <TextComponent color={theme.textSecondary}>{t('noFriendsFound')}</TextComponent>
                            </View>
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
    }
});
