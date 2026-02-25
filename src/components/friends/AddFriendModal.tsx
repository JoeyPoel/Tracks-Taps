import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { userService } from '@/src/services/userService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextComponent } from '../common/TextComponent';
import { FriendCard } from './FriendCard';
import { FriendSearchInput } from './FriendSearchInput';

import { useRouter } from 'expo-router';

interface AddFriendModalProps {
    visible: boolean;
    onClose: () => void;
}

export function AddFriendModal({ visible, onClose }: AddFriendModalProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const { sendFriendRequest } = useFriends();

    const fetchUsers = async (text: string, pageNum: number, append: boolean = false) => {
        if (!text || text.length < 2) return;

        setLoading(true);
        try {
            const data = await userService.searchUsers(text, pageNum, 20);
            if (data.length < 20) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (append) {
                setResults(prev => [...prev, ...data]);
            } else {
                setResults(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length < 2) {
            setResults([]);
            setHasMore(false);
            return;
        }

        setPage(1);
        await fetchUsers(text, 1, false);
    };

    const loadMore = async () => {
        if (!loading && hasMore && searchQuery.length >= 2) {
            const nextPage = page + 1;
            setPage(nextPage);
            await fetchUsers(searchQuery, nextPage, true);
        }
    };

    const handleAdd = async (item: any) => {
        const identifier = item.username || item.email;
        if (identifier && await sendFriendRequest(identifier)) {
            // Success
        }
    };

    const handleCardPress = (userId: string) => {
        onClose();
        // Add a small delay so the modal starts closing before pushing to the stack
        setTimeout(() => {
            router.push({ pathname: '/profile/friend-profile', params: { userId } });
        }, 100);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <TextComponent variant="h2" bold>{t('addFriend')}</TextComponent>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchSection}>
                    <FriendSearchInput
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onSend={() => results.length > 0 && handleAdd(results[0])}
                    />
                </View>

                {loading && page === 1 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loading && page > 1 ? (
                                <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />
                            ) : null
                        }
                        renderItem={({ item }) => (
                            <View style={styles.resultItem}>
                                <FriendCard
                                    friend={item}
                                    onPress={() => handleCardPress(item.id)}
                                />
                            </View>
                        )}
                        ListEmptyComponent={
                            searchQuery.length >= 2 ? (
                                <View style={styles.centerContainer}>
                                    <TextComponent color={theme.textSecondary}>{t('noUsersFound')}</TextComponent>
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    resultItem: {
        marginBottom: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    }
});
