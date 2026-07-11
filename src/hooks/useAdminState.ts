import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import client from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useStore } from '../store/store';

export interface ChallengeMetadata {
    id: number;
    title: string;
    type: string;
    points: number;
    content: string | null;
    hint: string | null;
    answer: string | null;
    options: string[];
}

export interface StopMetadata {
    id: number;
    number: number;
    name: string;
    description: string;
    longitude: number;
    latitude: number;
    type: string;
    challenges?: ChallengeMetadata[];
}

export interface TourMetadata {
    id: number;
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    distance: number;
    duration: number;
    points: number;
    createdAt: string;
    author: {
        id: number;
        name: string;
        avatarUrl: string | null;
    };
    stops?: StopMetadata[];
    challenges?: ChallengeMetadata[];
}

export interface StatsData {
    users: number;
    tours: number;
    activeSessions: number;
    purchasesCount: number;
    tokensPurchased: number;
    tourStatusCounts: {
        DRAFT: number;
        PENDING_REVIEW: number;
        PUBLISHED: number;
        REJECTED: number;
    };
}

export type AdminTab = 'settings' | 'stats' | 'moderation' | 'users' | 'reviews';

export function useAdminState() {
    const { theme, refreshThemeSettings } = useTheme();
    const { t, language } = useLanguage();
    const router = useRouter();
    const { user, refreshUser } = useUserContext();

    const [activeTab, setActiveTab] = useState<AdminTab>('settings');

    // General loading/saving
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Tab-specific loading & loaded states
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingPending, setLoadingPending] = useState(false);
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [pendingLoaded, setPendingLoaded] = useState(false);

    // Free Tours Settings
    const [freeEnabled, setFreeEnabled] = useState(false);
    const [untilDate, setUntilDate] = useState<Date | null>(null);

    // Global Theme Settings
    const [globalThemeOverride, setGlobalThemeOverride] = useState<string | null>(null);
    const [autoThemeEnabled, setAutoThemeEnabled] = useState(true);

    // Show Unmoderated Tours Settings
    const [showUnmoderatedTours, setShowUnmoderatedTours] = useState(false);

    // Custom Date calendar states
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const months = useMemo(() => [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ], []);

    const getDaysInMonth = useCallback((year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    }, []);

    const getFirstDayOfMonth = useCallback((year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    }, []);

    const handleSelectDay = useCallback((day: number) => {
        const selected = new Date(currentYear, currentMonth, day, 23, 59, 59, 999);
        setUntilDate(selected);
    }, [currentYear, currentMonth]);

    const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(prev => prev - 1);
            } else {
                setCurrentMonth(prev => prev - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(prev => prev + 1);
            } else {
                setCurrentMonth(prev => prev + 1);
            }
        }
    }, [currentMonth]);

    // Stats and Moderation data
    const [stats, setStats] = useState<StatsData | null>(null);
    const [pendingTours, setPendingTours] = useState<TourMetadata[]>([]);
    const [moderatingAction, setModeratingAction] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
    const [expandedTours, setExpandedTours] = useState<Record<number, boolean>>({});

    // Rejection Reason Modal States
    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
    const [rejectionTourId, setRejectionTourId] = useState<number | null>(null);
    const [rejectionReasonText, setRejectionReasonText] = useState('');

    // Moderation search & sort state
    const [moderationSearchQuery, setModerationSearchQuery] = useState('');
    const [moderationSortOption, setModerationSortOption] = useState<'oldest' | 'newest' | 'points-desc' | 'distance-desc'>('oldest');

    // Users state
    const [usersList, setUsersList] = useState<any[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [togglingAdminId, setTogglingAdminId] = useState<number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editTokens, setEditTokens] = useState('0');
    const [editXp, setEditXp] = useState('0');
    const [editCustomTheme, setEditCustomTheme] = useState<string | null>(null);
    const [savingUser, setSavingUser] = useState(false);

    // Reviews state
    const [reviewsList, setReviewsList] = useState<any[]>([]);
    const [reviewSearchQuery, setReviewSearchQuery] = useState('');
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

    // JSON Tour Uploader and Prompt Copier state
    const [jsonText, setJsonText] = useState('');
    const [savingJson, setSavingJson] = useState(false);
    const [copyingPrompt, setCopyingPrompt] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        setLoadingStats(true);
        try {
            const statsRes = await client.get(`/admin?action=stats&userId=${user.id}`);
            setStats(statsRes.data);
            setStatsLoaded(true);
        } catch (error) {
            console.error('Failed to fetch admin statistics:', error);
            Alert.alert('Error', 'Failed to load statistics');
        } finally {
            setLoadingStats(false);
        }
    }, [user]);

    const fetchPendingTours = useCallback(async () => {
        if (!user) return;
        setLoadingPending(true);
        try {
            const pendingRes = await client.get(`/admin?action=pending-tours&userId=${user.id}`);
            setPendingTours(pendingRes.data);
            setPendingLoaded(true);
        } catch (error) {
            console.error('Failed to fetch pending tours:', error);
            Alert.alert('Error', 'Failed to load pending tours');
        } finally {
            setLoadingPending(false);
        }
    }, [user]);

    const fetchUsers = useCallback(async (customQuery?: string) => {
        if (!user) return;
        setLoadingUsers(true);
        try {
            const queryToUse = customQuery !== undefined ? customQuery : userSearchQuery;
            const res = await client.get(`/admin?action=users&userId=${user.id}&query=${encodeURIComponent(queryToUse)}`);
            setUsersList(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoadingUsers(false);
        }
    }, [user, userSearchQuery]);

    const fetchReviews = useCallback(async (customQuery?: string) => {
        if (!user) return;
        setLoadingReviews(true);
        try {
            const queryToUse = customQuery !== undefined ? customQuery : reviewSearchQuery;
            const res = await client.get(`/admin?action=reviews&userId=${user.id}&query=${encodeURIComponent(queryToUse)}`);
            setReviewsList(res.data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoadingReviews(false);
        }
    }, [user, reviewSearchQuery]);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch free tours settings
            const settingsRes = await client.get('/app-settings');
            setFreeEnabled(settingsRes.data.freeToursEnabled);
            setGlobalThemeOverride(settingsRes.data.globalThemeOverride || null);
            setAutoThemeEnabled(settingsRes.data.autoThemeEnabled !== false);
            setShowUnmoderatedTours(settingsRes.data.showUnmoderatedTours || false);
            const dateVal = settingsRes.data.freeToursUntil ? new Date(settingsRes.data.freeToursUntil) : null;
            setUntilDate(dateVal);
            if (dateVal) {
                setCurrentMonth(dateVal.getMonth());
                setCurrentYear(dateVal.getFullYear());
            }

            // Fetch stats to always populate pending reviews banner on load
            if (user) {
                const statsRes = await client.get(`/admin?action=stats&userId=${user.id}`);
                setStats(statsRes.data);
                setStatsLoaded(true);
            }
        } catch (error) {
            console.error('Failed to fetch admin panel settings:', error);
            Alert.alert(t('error') || 'Error', 'Failed to load panel settings');
        } finally {
            setLoading(false);
        }
    }, [user, t]);

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user, fetchInitialData]);

    useEffect(() => {
        if (user) {
            if (activeTab === 'stats' && !statsLoaded) {
                fetchStats();
            } else if (activeTab === 'moderation' && !pendingLoaded) {
                fetchPendingTours();
            } else if (activeTab === 'users') {
                fetchUsers();
            } else if (activeTab === 'reviews') {
                fetchReviews();
            }
        }
    }, [activeTab, user, statsLoaded, pendingLoaded, fetchStats, fetchPendingTours, fetchUsers, fetchReviews]);

    const handleToggleUserAdmin = async (targetUserId: number, currentAdminStatus: boolean) => {
        if (!user) return;
        setTogglingAdminId(targetUserId);
        try {
            await client.post('/admin', {
                action: 'toggle-user-admin',
                userId: user.id,
                targetUserId,
                isAdmin: !currentAdminStatus
            });
            Alert.alert('Success', `User admin status ${!currentAdminStatus ? 'granted' : 'revoked'}.`);
            setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, isAdmin: !currentAdminStatus } : u));
        } catch (error: any) {
            console.error('Failed to toggle admin status:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to toggle admin status');
        } finally {
            setTogglingAdminId(null);
        }
    };

    const handleDeleteUser = async (targetUserId: number, targetUserName: string) => {
        if (!user) return;
        Alert.alert(
            'Confirm User Deletion',
            `Are you absolutely sure you want to delete/anonymize user "${targetUserName}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingUserId(targetUserId);
                        try {
                            await client.post('/admin', {
                                action: 'delete-user',
                                userId: user.id,
                                targetUserId
                            });
                            Alert.alert('Success', 'User deleted/anonymized successfully.');
                            setUsersList(prev => prev.filter(u => u.id !== targetUserId));
                        } catch (error: any) {
                            console.error('Failed to delete user:', error);
                            Alert.alert('Error', error.response?.data?.error || 'Failed to delete user');
                        } finally {
                            setDeletingUserId(null);
                        }
                    }
                }
            ]
        );
    };

    const startEditingUser = (usr: any) => {
        setEditingUserId(usr.id);
        setEditName(usr.name || '');
        setEditEmail(usr.email || '');
        setEditTokens(String(usr.tokens || 0));
        setEditXp(String(usr.xp || 0));
        setEditCustomTheme(usr.customTheme || null);
    };

    const handleSaveUser = async () => {
        if (!user || !editingUserId) return;
        setSavingUser(true);
        try {
            const res = await client.post('/admin', {
                action: 'update-user',
                userId: user.id,
                targetUserId: editingUserId,
                name: editName,
                email: editEmail,
                tokens: Number(editTokens),
                xp: Number(editXp),
                customTheme: editCustomTheme
            });
            Alert.alert('Success', 'User updated successfully.');
            setUsersList(prev => prev.map(u => u.id === editingUserId ? res.data.user : u));
            setEditingUserId(null);
            if (editingUserId === user.id) {
                useStore.setState({ user: res.data.user });
                if (refreshUser) {
                    await refreshUser();
                }
                await refreshThemeSettings();
            }
        } catch (error: any) {
            console.error('Failed to save user details:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to save user details');
        } finally {
            setSavingUser(false);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!user) return;
        Alert.alert(
            'Confirm Review Deletion',
            'Are you sure you want to delete this tour review?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingReviewId(reviewId);
                        try {
                            await client.post('/admin', {
                                action: 'delete-review',
                                userId: user.id,
                                reviewId
                            });
                            Alert.alert('Success', 'Review deleted successfully.');
                            setReviewsList(prev => prev.filter(r => r.id !== reviewId));
                        } catch (error: any) {
                            console.error('Failed to delete review:', error);
                            Alert.alert('Error', error.response?.data?.error || 'Failed to delete review');
                        } finally {
                            setDeletingReviewId(null);
                        }
                    }
                }
            ]
        );
    };

    const setQuickPreset = (days: number | null) => {
        if (days === null) {
            setUntilDate(null);
        } else {
            const date = new Date();
            date.setDate(date.getDate() + days);
            date.setHours(23, 59, 59, 999);
            setUntilDate(date);
            setCurrentMonth(date.getMonth());
            setCurrentYear(date.getFullYear());
        }
    };

    const handleSaveSettings = async () => {
        if (!user) return;

        let finalDateString: string | null = null;
        if (freeEnabled && untilDate) {
            finalDateString = untilDate.toISOString();
        }

        setSaving(true);
        try {
            await client.patch('/app-settings', {
                userId: user.id,
                freeToursEnabled: freeEnabled,
                freeToursUntil: finalDateString,
                globalThemeOverride,
                autoThemeEnabled,
                showUnmoderatedTours
            });
            Alert.alert(t('success') || 'Success', 'Admin settings updated successfully!');
            await refreshThemeSettings();
            const statsRes = await client.get(`/admin?action=stats&userId=${user?.id}`);
            setStats(statsRes.data);
            setStatsLoaded(true);
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            Alert.alert(t('error') || 'Error', error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleModerateTour = async (tourId: number, status: 'PUBLISHED' | 'REJECTED') => {
        if (!user) return;
        setModeratingAction({ id: tourId, action: status === 'PUBLISHED' ? 'approve' : 'reject' });
        try {
            await client.post('/admin', {
                action: 'update-tour-status',
                userId: user.id,
                tourId,
                status
            });
            Alert.alert('Success', `Tour status updated to ${status}`);
            setPendingTours(prev => prev.filter(t => t.id !== tourId));
            const statsRes = await client.get(`/admin?action=stats&userId=${user?.id}`);
            setStats(statsRes.data);
            setStatsLoaded(true);
        } catch (error: any) {
            console.error('Failed to moderate tour:', error);
            Alert.alert('Error', error.message || 'Failed to update tour status');
        } finally {
            setModeratingAction(null);
        }
    };

    const openRejectionPrompt = (tourId: number) => {
        setRejectionTourId(tourId);
        setRejectionReasonText('');
        setRejectionModalVisible(true);
    };

    const handleConfirmRejection = async () => {
        if (!rejectionTourId || !user) return;
        const tourId = rejectionTourId;
        const reason = rejectionReasonText.trim();
        if (!reason) {
            Alert.alert('Required', 'Please provide a reason for rejection.');
            return;
        }

        setRejectionModalVisible(false);
        setModeratingAction({ id: tourId, action: 'reject' });
        try {
            await client.post('/admin', {
                action: 'update-tour-status',
                userId: user.id,
                tourId,
                status: 'REJECTED',
                rejectionReason: reason
            });
            Alert.alert('Success', 'Tour status updated to rejected.');
            setPendingTours(prev => prev.filter(t => t.id !== tourId));
            const statsRes = await client.get(`/admin?action=stats&userId=${user?.id}`);
            setStats(statsRes.data);
            setStatsLoaded(true);
        } catch (error: any) {
            console.error('Failed to moderate tour:', error);
            Alert.alert('Error', error.message || 'Failed to update tour status');
        } finally {
            setModeratingAction(null);
            setRejectionTourId(null);
            setRejectionReasonText('');
        }
    };

    const getFormattedPresetCheck = useCallback((value: number | null) => {
        if (value === null) {
            return untilDate === null;
        }
        if (!untilDate) return false;
        const diffMs = untilDate.getTime() - (new Date().getTime() + value * 86400000);
        return Math.abs(diffMs) < 600000;
    }, [untilDate]);

    const handleUploadTourJson = async () => {
        if (!jsonText.trim()) {
            Alert.alert('Error', 'Please paste some JSON first.');
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonText.trim());
        } catch (e: any) {
            Alert.alert('Invalid JSON', 'Could not parse the pasted text as JSON: ' + e.message);
            return;
        }

        setSavingJson(true);
        try {
            await client.post('/tours/json', parsed);
            Alert.alert('Success', 'Tour added successfully!');
            setJsonText('');
            if (activeTab === 'moderation') {
                fetchPendingTours();
            }
        } catch (error: any) {
            console.error('Failed to upload tour JSON:', error);
            Alert.alert('Error', error.response?.data?.details || error.response?.data?.error || 'Failed to upload tour');
        } finally {
            setSavingJson(false);
        }
    };

    const handleCopyPrompt = async () => {
        if (!user) return;
        setCopyingPrompt(true);
        try {
            const res = await client.get(`/admin?action=prompt&userId=${user.id}`);
            const promptText = res.data.prompt;
            if (promptText) {
                await Clipboard.setStringAsync(promptText);
                Alert.alert('Copied', 'Tour Generator prompt has been copied to your clipboard!');
            } else {
                Alert.alert('Error', 'Prompt content was empty.');
            }
        } catch (error: any) {
            console.error('Failed to copy prompt:', error);
            Alert.alert('Error', 'Failed to retrieve prompt from server.');
        } finally {
            setCopyingPrompt(false);
        }
    };

    const toggleTourExpand = useCallback((tourId: number) => {
        setExpandedTours(prev => ({ ...prev, [tourId]: !prev[tourId] }));
    }, []);

    const filteredAndSortedTours = useMemo(() => {
        let list = [...pendingTours];

        if (moderationSearchQuery.trim()) {
            const query = moderationSearchQuery.toLowerCase();
            list = list.filter(tour =>
                tour.title.toLowerCase().includes(query) ||
                (tour.description && tour.description.toLowerCase().includes(query)) ||
                tour.author.name.toLowerCase().includes(query) ||
                tour.location.toLowerCase().includes(query)
            );
        }

        list.sort((a, b) => {
            if (moderationSortOption === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (moderationSortOption === 'points-desc') {
                return b.points - a.points;
            } else if (moderationSortOption === 'distance-desc') {
                return b.distance - a.distance;
            } else {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
        });

        return list;
    }, [pendingTours, moderationSearchQuery, moderationSortOption]);

    return {
        theme,
        t,
        language,
        activeTab,
        setActiveTab,
        loading,
        saving,
        loadingStats,
        loadingPending,
        freeEnabled,
        setFreeEnabled,
        untilDate,
        setUntilDate,
        globalThemeOverride,
        setGlobalThemeOverride,
        autoThemeEnabled,
        setAutoThemeEnabled,
        showUnmoderatedTours,
        setShowUnmoderatedTours,
        currentMonth,
        currentYear,
        months,
        getDaysInMonth,
        getFirstDayOfMonth,
        handleSelectDay,
        handleMonthChange,
        stats,
        pendingTours,
        moderatingAction,
        expandedTours,
        rejectionModalVisible,
        setRejectionModalVisible,
        rejectionTourId,
        rejectionReasonText,
        setRejectionReasonText,
        moderationSearchQuery,
        setModerationSearchQuery,
        moderationSortOption,
        setModerationSortOption,
        filteredAndSortedTours,
        usersList,
        userSearchQuery,
        setUserSearchQuery,
        loadingUsers,
        togglingAdminId,
        deletingUserId,
        editingUserId,
        setEditingUserId,
        editName,
        setEditName,
        editEmail,
        setEditEmail,
        editTokens,
        setEditTokens,
        editXp,
        setEditXp,
        editCustomTheme,
        setEditCustomTheme,
        savingUser,
        reviewsList,
        reviewSearchQuery,
        setReviewSearchQuery,
        loadingReviews,
        deletingReviewId,
        fetchUsers,
        fetchReviews,
        handleToggleUserAdmin,
        handleDeleteUser,
        startEditingUser,
        handleSaveUser,
        handleDeleteReview,
        setQuickPreset,
        handleSaveSettings,
        handleModerateTour,
        openRejectionPrompt,
        handleConfirmRejection,
        getFormattedPresetCheck,
        toggleTourExpand,
        jsonText,
        setJsonText,
        savingJson,
        copyingPrompt,
        handleUploadTourJson,
        handleCopyPrompt
    };
}
