import { AnimatedButton } from '@/src/components/common/AnimatedButton';
import { AppModal } from '@/src/components/common/AppModal';
import { EmptyState } from '@/src/components/common/EmptyState';
import { FadeInItem } from '@/src/components/common/FadeInList';
import { ScreenHeader } from '@/src/components/common/ScreenHeader';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { TextComponent } from '@/src/components/common/TextComponent';
import { AddFriendModal } from '@/src/components/friends/AddFriendModal';
import { FriendCard } from '@/src/components/friends/FriendCard';
import { FriendsTabs } from '@/src/components/friends/FriendsTabs';
import { RequestCard } from '@/src/components/friends/RequestCard';
import { TourInviteCard } from '@/src/components/friends/TourInviteCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { useInvites } from '@/src/hooks/useInvites';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FriendsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [addModalVisible, setAddModalVisible] = useState(false);

    const {
        friends,
        requests,
        loadingFriends,
        loadingRequests,
        loadFriends,
        loadRequests,
        respondToRequest
    } = useFriends();

    const {
        invites,
        loading: loadingInvites,
        processingId,
        refresh: refreshInvites,
        acceptInvite,
        declineInvite,
        expiredModalVisible,
        setExpiredModalVisible
    } = useInvites();

    useEffect(() => {
        if (activeTab === 'friends') {
            loadFriends();
        } else {
            loadRequests();
        }
    }, [activeTab]);

    const handleRefresh = useCallback(() => {
        if (activeTab === 'friends') {
            loadFriends(true);
        } else {
            loadRequests(true);
            refreshInvites();
        }
    }, [activeTab, loadFriends, loadRequests, refreshInvites]);

    const combinedRequests = useMemo(() => {
        // Return whatever is needed for FlatList Data
        if (activeTab !== 'requests') return [];
        const combined: any[] = [];

        // Add game invites first 
        invites.forEach(invite => {
            combined.push({ type: 'invite', data: invite });
        });

        // Add friend requests
        requests.forEach(req => {
            combined.push({ type: 'friend', data: req });
        });

        return combined;
    }, [activeTab, invites, requests]);

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <FadeInItem index={index}>
            {activeTab === 'friends' ? (
                <FriendCard friend={item} />
            ) : item.type === 'invite' ? (
                <TourInviteCard
                    invite={item.data}
                    processingId={processingId}
                    onAccept={acceptInvite}
                    onDecline={declineInvite}
                />
            ) : (
                <RequestCard
                    request={item.data}
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
                rightElement={
                    <TouchableOpacity
                        onPress={() => setAddModalVisible(true)}
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                    >
                        <Ionicons name="person-add" size={20} color="#FFF" />
                    </TouchableOpacity>
                }
            />

            <View style={styles.container}>
                <View style={styles.headerSection}>
                    <FriendsTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        requestCount={requests.length + (invites?.length || 0)}
                    />
                </View>

                <FlatList
                    data={activeTab === 'friends' ? friends : combinedRequests}
                    renderItem={renderItem}
                    keyExtractor={(item) => activeTab === 'friends' ? `friend-${item.id}` : `${item.type}-${item.data.id}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={activeTab === 'friends' ? loadingFriends : (loadingRequests || loadingInvites)}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    ListEmptyComponent={
                        (activeTab === 'friends' ? loadingFriends : (loadingRequests || loadingInvites)) ? null : (
                            <EmptyState
                                icon={activeTab === 'friends' ? "people" : "mail-unread"}
                                title={activeTab === 'friends' ? t('noFriendsYet') : t('noRequestsAndInvites')}
                                message={activeTab === 'friends' ? t('searchFriendsText') : t('noRequestsAndInvitesText')}
                            />
                        )
                    }
                />
            </View>

            <AddFriendModal
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
            />

            <AppModal
                visible={expiredModalVisible}
                onClose={() => setExpiredModalVisible(false)}
                title={"Invitation Expired"}
                alignment="center"
            >
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <TextComponent color={theme.textSecondary} center style={{ marginBottom: 20 }}>
                        {"This invitation has expired. The tour may have already finished or been cancelled."}
                    </TextComponent>
                    <AnimatedButton
                        title="OK"
                        onPress={() => setExpiredModalVisible(false)}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                </View>
            </AppModal>
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
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 0,
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
