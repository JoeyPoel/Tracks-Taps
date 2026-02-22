import { friendService } from '@/src/services/friendsService';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useToast } from '../context/ToastContext';
import { useStore } from '../store/store';
import { useAchievements } from './useAchievements';

export function useFriends() {
    const {
        friends, requests, loadingFriends, loadingRequests,
        fetchFriends, fetchRequests
    } = useStore();
    const [actionLoading, setActionLoading] = useState(false);

    const loading = loadingFriends || loadingRequests;

    const loadFriends = useCallback(async (force = false) => {
        await fetchFriends(force);
    }, [fetchFriends]);

    const loadRequests = useCallback(async (force = false) => {
        await fetchRequests(force);
    }, [fetchRequests]);

    // Hooks
    const { unlockAchievement } = useAchievements();
    const { showToast } = useToast();

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
            await loadRequests(true);
            if (action === 'ACCEPT') {
                await loadFriends(true);

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
