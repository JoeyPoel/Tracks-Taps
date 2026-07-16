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
    initialInvitedIds?: number[];
}

export default function InviteFriendsModal({ visible, onClose, activeTourId, initialInvitedIds = [] }: InviteFriendsModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { friends, loadFriends, inviteFriendsToLobby, cancelLobbyInvite, loading, actionLoading } = useFriends();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (visible) {
            setSelectedIds(initialInvitedIds);
        }
    }, [visible, initialInvitedIds]);

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleInvite = async () => {
        const newlySelected = selectedIds.filter(id => !initialInvitedIds.includes(id));
        const unselected = initialInvitedIds.filter(id => !selectedIds.includes(id));

        let success = true;

        if (unselected.length > 0) {
            const cancelPromises = unselected.map(id => cancelLobbyInvite(id, activeTourId));
            const results = await Promise.all(cancelPromises);
            if (results.some(r => !r)) success = false;
        }

        if (newlySelected.length > 0) {
            const inviteSuccess = await inviteFriendsToLobby(newlySelected, activeTourId);
            if (!inviteSuccess) success = false;
        }

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

    const hasChanges = 
        selectedIds.length !== initialInvitedIds.length ||
        selectedIds.some(id => !initialInvitedIds.includes(id));

    const buttonTitle = actionLoading
        ? t('sendingInvites') || 'Sending Invites...'
        : hasChanges
            ? t('saveChanges') || 'Save Changes'
            : t('inviteSelected') || 'Invite Selected';

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={t('inviteFriends')}
            subtitle={t('selectFriendsLobby')}
            modalStyle={{ maxHeight: '70%' }}
        >
            <View>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={friends}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
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
                        title={buttonTitle}
                        onPress={handleInvite}
                        disabled={!hasChanges || actionLoading}
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
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        marginTop: 8,
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
