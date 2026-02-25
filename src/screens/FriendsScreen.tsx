import { EmptyState } from '@/src/components/common/EmptyState';
import { FadeInItem } from '@/src/components/common/FadeInList';
import { ScreenHeader } from '@/src/components/common/ScreenHeader';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { AddFriendModal } from '@/src/components/friends/AddFriendModal';
import { FriendCard } from '@/src/components/friends/FriendCard';
import { FriendsTabs } from '@/src/components/friends/FriendsTabs';
import { RequestCard } from '@/src/components/friends/RequestCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
        }
    }, [activeTab, loadFriends, loadRequests]);

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
                        requestCount={requests.length}
                    />
                </View>

                <FlatList
                    data={activeTab === 'friends' ? friends : requests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={activeTab === 'friends' ? loadingFriends : loadingRequests}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    ListEmptyComponent={
                        (activeTab === 'friends' ? loadingFriends : loadingRequests) ? null : (
                            <EmptyState
                                icon={activeTab === 'friends' ? "people" : "mail-unread"}
                                title={activeTab === 'friends' ? t('noFriendsYet') : t('noRequests')}
                                message={activeTab === 'friends' ? t('searchFriendsText') : t('noRequestsText')}
                            />
                        )
                    }
                />
            </View>

            <AddFriendModal
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
            />
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
