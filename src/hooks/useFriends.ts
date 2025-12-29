import { friendService } from '@/src/services/friendsService';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useToast } from '../context/ToastContext';
import { useAchievements } from './useAchievements';

export function useFriends() {
    const [friends, setFriends] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadFriends = useCallback(async () => {
        setLoading(true);
        try {
            const data = await friendService.getFriends();
            setFriends(data || []);
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await friendService.getFriendRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hooks
    const { unlockAchievement } = useAchievements();
    const { showToast } = useToast();

    // ... existing load functions ...

    const sendFriendRequest = async (email: string) => {
        if (!email) return;
        setActionLoading(true);
        try {
            await friendService.sendFriendRequest(email);
            Alert.alert('Success', 'Friend request sent!');
            return true;
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send request');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const respondToRequest = async (requestId: number, action: 'ACCEPT' | 'DECLINE') => {
        try {
            await friendService.respondToRequest(requestId, action);
            // Refresh requests list locally or re-fetch
            await loadRequests();
            if (action === 'ACCEPT') {
                await loadFriends();

                // Unlock Achievement: Social Butterfly
                const achievement = await unlockAchievement('social-butterfly');
                if (achievement) {
                    showToast({
                        title: achievement.title,
                        message: achievement.description,
                        emoji: achievement.icon === 'people' ? '🦋' : '🏆', // Fallback or mapping
                        backgroundColor: achievement.color
                    });
                }
            }
        } catch (error: any) {
            console.error('Error responding to request:', error);
            Alert.alert('Error', 'Failed to process request');
        }
    };

    const inviteFriendsToLobby = async (friendIds: number[], tourId: number) => {
        if (friendIds.length === 0) return;
        setActionLoading(true);
        try {
            await friendService.sendLobbyInvite(friendIds, tourId);
            Alert.alert('Success', 'Invites sent!');
            return true;
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send invites');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        friends,
        requests,
        loading,
        actionLoading,
        loadFriends,
        loadRequests,
        sendFriendRequest,
        respondToRequest,
        inviteFriendsToLobby
    };
}
