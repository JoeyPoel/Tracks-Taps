import { FadeInItem } from '@/src/components/common/FadeInList';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { FriendCard } from '@/src/components/friends/FriendCard';
import { FriendSearchInput } from '@/src/components/friends/FriendSearchInput';
import { FriendsTabs } from '@/src/components/friends/FriendsTabs';
import { RequestCard } from '@/src/components/friends/RequestCard';
import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function FriendsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
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
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} withScrollView={false} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppHeader showBackButton title="Social Hub" />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <FriendsTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    requestCount={requests.length}
                />

                <View style={styles.content}>
                    {activeTab === 'friends' && (
                        <FriendSearchInput
                            value={searchEmail}
                            onChangeText={setSearchEmail}
                            onSend={handleSend}
                        />
                    )}

                    <FlatList
                        scrollEnabled={false}
                        data={activeTab === 'friends' ? friends : requests}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ gap: 12 }}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color={theme.textSecondary + '40'} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    {activeTab === 'friends' ? 'No friends yet. Add some!' : 'No pending requests.'}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
