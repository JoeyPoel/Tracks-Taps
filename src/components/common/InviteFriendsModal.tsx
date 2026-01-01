import { AnimatedButton } from '@/src/components/common/AnimatedButton';
import { AppModal } from '@/src/components/common/AppModal';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { SelectableFriendCard } from '@/src/components/friends/SelectableFriendCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

interface InviteFriendsModalProps {
    visible: boolean;
    onClose: () => void;
    activeTourId: number;
}

export default function InviteFriendsModal({ visible, onClose, activeTourId }: InviteFriendsModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { friends, loadFriends, inviteFriendsToLobby, loading, actionLoading } = useFriends();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (visible) {
            loadFriends();
            setSelectedIds([]);
        }
    }, [visible]);

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleInvite = async () => {
        const success = await inviteFriendsToLobby(selectedIds, activeTourId);
        if (success) {
            onClose();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <SelectableFriendCard
            friend={item}
            isSelected={selectedIds.includes(item.id)}
            onToggle={toggleSelection}
        />
    );

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={t('inviteFriends')}
            subtitle={t('selectFriendsLobby')}
            height="80%"
            modalStyle={{ padding: 0 }}
        >
            <View style={{ flex: 1 }}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={friends}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ padding: 24, paddingBottom: 100, gap: 12 }}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color={theme.textSecondary + '50'} />
                                <TextComponent style={{ marginTop: 12 }} color={theme.textSecondary} center variant="body">
                                    {t('noFriendsFound')}
                                </TextComponent>
                            </View>
                        }
                    />
                )}

                <View style={[styles.footer, { borderTopColor: theme.bgSecondary, backgroundColor: theme.bgPrimary }]}>
                    <AnimatedButton
                        title={actionLoading ? t('sendingInvites') : `${t('inviteSelected')} (${selectedIds.length})`}
                        onPress={handleInvite}
                        disabled={selectedIds.length === 0 || actionLoading}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                </View>
            </View>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    footer: {
        padding: 24,
        borderTopWidth: 1,
        paddingBottom: 40,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
});
