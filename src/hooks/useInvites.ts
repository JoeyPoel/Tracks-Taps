import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { Invite, inviteService } from '../services/inviteService';

export const useInvites = () => {
    const { user } = useUserContext();
    const router = useRouter();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [expiredModalVisible, setExpiredModalVisible] = useState(false);

    const fetchInvites = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await inviteService.fetchInvites();
            if (Array.isArray(data)) {
                setInvites(data);
            } else {
                console.warn('fetchInvites returned non-array:', data);
                setInvites([]);
            }
        } catch (error) {
            console.error('Failed to fetch invites:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);


    useEffect(() => {
        if (!user) return;

        fetchInvites();

        // Subscribe to real-time invites (INSERT and DELETE)
        const channel = supabase
            .channel('invites_channel')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events to catch deletions when active Tour is finished
                    schema: 'public',
                    table: 'GameInvite',
                    filter: `inviteeId=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Invite changes received, refreshing...', payload);
                    fetchInvites();
                }
            )
            .subscribe();


        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchInvites]);


    const acceptInvite = async (inviteId: number) => {
        try {
            setProcessingId(inviteId);
            const result = await inviteService.acceptInvite(inviteId);

            // If success, navigate to lobby
            if (result.activeTourId) {
                router.push({
                    pathname: '/lobby',
                    params: { activeTourId: result.activeTourId }
                });
            }

            // Remove from list
            setInvites(prev => prev.filter(i => i.id !== inviteId));

        } catch (error: any) {
            console.error('Failed to accept invite:', error);

            // If the backend returns this specific error or a 404 (meaning it's gone)
            const isExpiredError =
                error?.response?.data?.error?.includes('Invite not found') ||
                error?.response?.data?.error?.includes('Invite is no longer pending') ||
                error?.message?.includes('not found') ||
                error?.response?.status === 404;

            if (isExpiredError) {
                setInvites(prev => prev.filter(i => i.id !== inviteId));
                setExpiredModalVisible(true);
            } else {
                alert('Failed to join game. It might have already started or been cancelled.');
            }
        } finally {
            setProcessingId(null);
        }
    };

    const declineInvite = async (inviteId: number) => {
        try {
            setProcessingId(inviteId);
            await inviteService.declineInvite(inviteId);
            // Remove from list
            setInvites(prev => prev.filter(i => i.id !== inviteId));
        } catch (error) {
            console.error('Failed to decline invite:', error);
        } finally {
            setProcessingId(null);
        }
    };

    return {
        invites,
        loading,
        processingId,
        expiredModalVisible,
        setExpiredModalVisible,
        refresh: fetchInvites,
        acceptInvite,
        declineInvite
    };
};

