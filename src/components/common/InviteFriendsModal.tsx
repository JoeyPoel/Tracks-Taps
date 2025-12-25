import { AnimatedButton } from '@/src/components/common/AnimatedButton';
import { SelectableFriendCard } from '@/src/components/friends/SelectableFriendCard';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface InviteFriendsModalProps {
    visible: boolean;
    onClose: () => void;
    activeTourId: number;
}

export default function InviteFriendsModal({ visible, onClose, activeTourId }: InviteFriendsModalProps) {
    const { theme } = useTheme();
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
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.bgPrimary }]}>
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={[styles.title, { color: theme.textPrimary }]}>Invite Friends</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select friends to join your lobby</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.bgSecondary }]}>
                            <Ionicons name="close" size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={friends}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ padding: 20, gap: 12 }}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="people-outline" size={48} color={theme.textSecondary + '50'} />
                                    <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 12 }}>
                                        No friends found. Add some friends first!
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    <View style={[styles.footer, { borderTopColor: theme.bgSecondary }]}>
                        <AnimatedButton
                            title={actionLoading ? "Sending Invites..." : `Invite Selected (${selectedIds.length})`}
                            onPress={handleInvite}
                            disabled={selectedIds.length === 0 || actionLoading}
                            variant="primary"
                            style={{ width: '100%' }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        height: '80%', // Taller modal for better visibility
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    headerTextContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        paddingBottom: 40, // Extra padding for safe area
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
