import { EmptyState } from '@/src/components/common/EmptyState';
import { FadeInItem } from '@/src/components/common/FadeInList';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { FriendCard } from '@/src/components/friends/FriendCard';
import { FriendSearchInput } from '@/src/components/friends/FriendSearchInput';
import { FriendsTabs } from '@/src/components/friends/FriendsTabs';
import { RequestCard } from '@/src/components/friends/RequestCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';

export default function FriendsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [searchEmail, setSearchEmail] = useState('');

    const {
        friends,
        requests,
        loadFriends,
        loadRequests,
        sendFriendRequest,
        respondToRequest
    } = useFriends();

    useEffect(() => {
        if (activeTab === 'friends') {
            loadFriends();
        } else {
            loadRequests();
        }
    }, [activeTab]);

    const handleSend = async () => {
        if (await sendFriendRequest(searchEmail)) {
            setSearchEmail('');
        }
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <FadeInItem index={index}>
            {activeTab === 'friends' ? (
                <FriendCard friend={item} />
            ) : (
                <RequestCard
                    request={item}
                    onAccept={(id) => respondToRequest(id, 'ACCEPT')}
                    onDecline={(id) => respondToRequest(id, 'DECLINE')}
                />
            )}
        </FadeInItem>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} withScrollView={false} includeTop={false} animateEntry={false} withBottomTabs={true}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader
                showBackButton
                title={activeTab === 'friends' ? t('friends') : t('requests')}
            />

            <View style={styles.container}>
                <View style={styles.headerSection}>
                    <FriendsTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        requestCount={requests.length}
                    />

                    {activeTab === 'friends' && (
                        <FriendSearchInput
                            value={searchEmail}
                            onChangeText={setSearchEmail}
                            onSend={handleSend}
                        />
                    )}
                </View>

                <FlatList
                    data={activeTab === 'friends' ? friends : requests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={activeTab === 'friends' ? "people" : "mail-unread"}
                            title={activeTab === 'friends' ? t('noFriendsYet') : t('noRequests')}
                            message={activeTab === 'friends' ? t('searchFriendsText') : t('noRequestsText')}
                        />
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingHorizontal: 20,
        marginBottom: 8,
        gap: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 0, // Cards handle their own spacing/border
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.8,
    },
});
