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

        // Subscribe to real-time invites
        const channel = supabase
            .channel('invites_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'GameInvite',
                    filter: `inviteeId=eq.${user.id}`,
                },
                (payload) => {
                    console.log('New invite received, refreshing...', payload);
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

        } catch (error) {
            console.error('Failed to accept invite:', error);
            alert('Failed to join game. It might have already started or been cancelled.');
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
        refresh: fetchInvites,
        acceptInvite,
        declineInvite
    };
};

