import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../store/store';
import { Invite, inviteService } from '../services/inviteService';
import { Alert } from 'react-native';

export const useInvites = () => {
    const { user } = useUserContext();
    const router = useRouter();
    const { t } = useLanguage();
    const { activeTours, abandonTour } = useStore();
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


    const acceptInviteProceed = async (inviteId: number) => {
        setProcessingId(inviteId);
        try {
            const result = await inviteService.acceptInvite(inviteId);

            // If success, navigate to lobby
            if (result.activeTourId) {
                router.push({
                    pathname: '/lobby',
                    params: { activeTourId: result.activeTourId.toString() }
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
                alert(t('failedToJoinInvite'));
            }
        } finally {
            setProcessingId(null);
        }
    };

    const acceptInvite = async (inviteId: number) => {
        try {
            const invite = invites.find(i => i.id === inviteId);
            if (!invite) return;

            const targetActiveTourId = invite.parsedData.activeTourId;

            // Check for existing active tours
            const existingTour = activeTours.length > 0 ? activeTours[0] : null;

            if (existingTour) {
                // Already in this exact tour session
                if (existingTour.id === targetActiveTourId) {
                    // Let them through immediately
                    await acceptInviteProceed(inviteId);
                    return;
                }

                // In a different tour session
                Alert.alert(
                    t('existingTourFound') || 'Active Tour Found',
                    t('existingTourWarning') || 'You are already in an active tour. Do you want to quit it to join this new one?',
                    [
                        { text: t('cancel') || 'Cancel', style: 'cancel' },
                        {
                            text: t('quitAndJoin') || 'Quit & Join', style: 'destructive', onPress: async () => {
                                setProcessingId(inviteId); // Show loading state
                                try {
                                    await abandonTour(existingTour.id, user!.id);
                                    await acceptInviteProceed(inviteId);
                                } catch (e) {
                                    console.error('Error abandoning tour:', e);
                                    alert(t('failedToQuitTour') || 'Failed to quit current tour.');
                                    setProcessingId(null);
                                }
                            }
                        }
                    ]
                );
                return;
            }

            // No existing tour, just proceed
            await acceptInviteProceed(inviteId);

        } catch (error: any) {
            console.error('Failed to initiate invite acceptance:', error);
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

