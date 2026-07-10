import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import client from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent';
import { HOLIDAY_THEMES, COLOR_THEMES } from '../constants/themes';
import { useStore } from '../store/store';

interface ChallengeMetadata {
    id: number;
    title: string;
    type: string;
    points: number;
    content: string | null;
    hint: string | null;
    answer: string | null;
    options: string[];
}

interface StopMetadata {
    id: number;
    number: number;
    name: string;
    description: string;
    longitude: number;
    latitude: number;
    type: string;
    challenges?: ChallengeMetadata[];
}

interface TourMetadata {
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

interface StatsData {
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

export default function AdminPanelScreen() {
    const { theme, refreshThemeSettings } = useTheme();
    const { t, language } = useLanguage();
    const router = useRouter();
    const { user, refreshUser } = useUserContext();

    const [activeTab, setActiveTab] = useState<'settings' | 'stats' | 'moderation' | 'users' | 'reviews'>('settings');

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

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleSelectDay = (day: number) => {
        const selected = new Date(currentYear, currentMonth, day, 23, 59, 59, 999);
        setUntilDate(selected);
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

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

    const filteredAndSortedTours = React.useMemo(() => {
        let list = [...pendingTours];

        // 1. Filter by search query
        if (moderationSearchQuery.trim()) {
            const query = moderationSearchQuery.toLowerCase();
            list = list.filter(tour => 
                tour.title.toLowerCase().includes(query) ||
                (tour.description && tour.description.toLowerCase().includes(query)) ||
                tour.author.name.toLowerCase().includes(query) ||
                tour.location.toLowerCase().includes(query)
            );
        }

        // 2. Sort by option
        list.sort((a, b) => {
            if (moderationSortOption === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (moderationSortOption === 'points-desc') {
                return b.points - a.points;
            } else if (moderationSortOption === 'distance-desc') {
                return b.distance - a.distance;
            } else {
                // 'oldest' default
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
        });

        return list;
    }, [pendingTours, moderationSearchQuery, moderationSortOption]);

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

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

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
    }, [activeTab, user, statsLoaded, pendingLoaded]);

    const fetchInitialData = async () => {
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
    };

    /**
     * Fetches general system statistics from the backend.
     * Sets stats loading states and updates the stats global state.
     */
    const fetchStats = async () => {
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
    };

    /**
     * Fetches tours awaiting review from the backend.
     * Sets moderation loading states and updates the pending tours global state.
     */
    const fetchPendingTours = async () => {
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
    };

    const fetchUsers = async (customQuery?: string) => {
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
    };

    const fetchReviews = async (customQuery?: string) => {
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
    };

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
            // Refresh theme if updating oneself
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
            date.setHours(23, 59, 59, 999); // round to end of day
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

    const getFormattedPresetCheck = (value: number | null) => {
        if (value === null) {
            return untilDate === null;
        }
        if (!untilDate) return false;
        const diffMs = untilDate.getTime() - (new Date().getTime() + value * 86400000);
        return Math.abs(diffMs) < 600000; // within 10 mins threshold
    };

    const toggleTourExpand = (tourId: number) => {
        setExpandedTours(prev => ({ ...prev, [tourId]: !prev[tourId] }));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
        
        const daysArray = [];
        for (let i = 0; i < firstDayIndex; i++) {
            daysArray.push(<View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const thisDate = new Date(currentYear, currentMonth, day);
            const isPast = thisDate.getTime() < today.getTime();
            
            const isSelected = untilDate && 
                untilDate.getDate() === day && 
                untilDate.getMonth() === currentMonth && 
                untilDate.getFullYear() === currentYear;

            const isToday = today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;

            daysArray.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.calendarDayCell,
                        isSelected && { backgroundColor: theme.primary },
                        isPast && styles.calendarDayCellDisabled
                    ]}
                    onPress={() => !isPast && handleSelectDay(day)}
                    disabled={isPast}
                >
                    <TextComponent
                        variant="caption"
                        bold={isSelected || isToday}
                        color={
                            isSelected 
                                ? '#fff' 
                                : isPast 
                                    ? theme.textTertiary + '80' 
                                    : isToday 
                                        ? theme.primary 
                                        : theme.textPrimary
                        }
                    >
                        {day}
                    </TextComponent>
                    {isToday && !isSelected && (
                        <View style={[styles.todayIndicator, { backgroundColor: theme.primary }]} />
                    )}
                </TouchableOpacity>
            );
        }

        return daysArray;
    };

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false} withBottomTabs={true}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader showBackButton title="Admin Panel" />

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <>
                    {/* Scrollable Tab Controls */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.tabScrollView, { backgroundColor: theme.bgSecondary }]}
                contentContainerStyle={styles.tabScrollContent}
            >
                {(['settings', 'stats', 'moderation', 'users', 'reviews'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabButton,
                            activeTab === tab && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <TextComponent
                            variant="caption"
                            bold
                            color={activeTab === tab ? '#fff' : theme.textSecondary}
                        >
                            {tab === 'moderation' ? 'TOURS' : tab.toUpperCase()}
                        </TextComponent>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {stats && stats.tourStatusCounts.PENDING_REVIEW > 0 && (
                <TouchableOpacity 
                    style={[styles.notificationBanner, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                    onPress={() => setActiveTab('moderation')}
                >
                    <Ionicons name="notifications" size={20} color={theme.primary} />
                    <TextComponent variant="caption" bold color={theme.textPrimary} style={{ marginLeft: 8, flex: 1 }}>
                        There are {stats.tourStatusCounts.PENDING_REVIEW} tours pending review! Tap to moderate.
                    </TextComponent>
                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <View style={styles.sectionContainer}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                Global App Config
                            </TextComponent>

                            {/* Enable Free Tours Card */}
                            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                <View style={styles.settingRow}>
                                     <View style={styles.settingInfo}>
                                         <TextComponent variant="body" bold color={theme.textPrimary}>
                                             Enable Global Free Tours
                                         </TextComponent>
                                         <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                                             Allows all players to start any tours without spending tokens.
                                         </TextComponent>
                                     </View>
                                     <Switch
                                         value={freeEnabled}
                                         onValueChange={setFreeEnabled}
                                         trackColor={{ false: theme.bgInput, true: theme.primary }}
                                         thumbColor={Platform.OS === 'ios' ? '#fff' : (freeEnabled ? theme.primary : '#f4f3f4')}
                                     />
                                 </View>
                            </View>

                            {/* Free Tours Duration & Expiration (immediately below toggle) */}
                            {freeEnabled && (
                                <>
                                    <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                        Duration &amp; Expiration
                                    </TextComponent>

                                    {/* Presets Card */}
                                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.cardLabel}>
                                            QUICK PRESETS
                                        </TextComponent>
                                        <View style={styles.quickDates}>
                                            {[
                                                { label: 'Indefinite', value: null },
                                                { label: '1 Day', value: 1 },
                                                { label: '3 Days', value: 3 },
                                                { label: '1 Week', value: 7 },
                                            ].map((opt) => {
                                                const isActive = getFormattedPresetCheck(opt.value);
                                                return (
                                                    <TouchableOpacity
                                                        key={opt.label}
                                                        style={[
                                                            styles.presetCard,
                                                            {
                                                                backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                                                borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                                                borderWidth: 1.5
                                                            }
                                                        ]}
                                                        onPress={() => setQuickPreset(opt.value)}
                                                    >
                                                        <TextComponent
                                                            variant="caption"
                                                            bold={isActive}
                                                            color={isActive ? '#fff' : theme.textSecondary}
                                                        >
                                                            {opt.label}
                                                        </TextComponent>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Custom Expiration Date Picker (Calendar Grid) */}
                                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.cardLabel}>
                                            SET CUSTOM EXPIRATION DATE (END OF DAY)
                                        </TextComponent>

                                        {/* Calendar Header with Month/Year Navigation */}
                                        <View style={styles.calendarHeader}>
                                            <TouchableOpacity 
                                                onPress={() => handleMonthChange('prev')} 
                                                style={[styles.calendarMonthNav, { backgroundColor: theme.bgPrimary }]}
                                            >
                                                <Ionicons name="chevron-back" size={18} color={theme.textPrimary} />
                                            </TouchableOpacity>
                                            <TextComponent variant="body" bold color={theme.textPrimary}>
                                                {months[currentMonth]} {currentYear}
                                            </TextComponent>
                                            <TouchableOpacity 
                                                onPress={() => handleMonthChange('next')} 
                                                style={[styles.calendarMonthNav, { backgroundColor: theme.bgPrimary }]}
                                            >
                                                <Ionicons name="chevron-forward" size={18} color={theme.textPrimary} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Days of week */}
                                        <View style={styles.weekDaysRow}>
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                                <TextComponent 
                                                    key={d} 
                                                    variant="caption" 
                                                    bold 
                                                    color={theme.textTertiary} 
                                                    style={styles.weekDayHeader}
                                                >
                                                    {d}
                                                </TextComponent>
                                            ))}
                                        </View>

                                        {/* Calendar Grid */}
                                        <View style={styles.daysGrid}>
                                            {renderCalendar()}
                                        </View>
                                    </View>

                                    {/* Active Until Status Card */}
                                    {untilDate && (
                                        <View style={[styles.statusCard, { backgroundColor: theme.primary + '10' }]}>
                                            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 10 }}>
                                                Free tours active until end of day on: {untilDate.toLocaleDateString()}
                                            </TextComponent>
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Show Unmoderated Tours Card */}
                            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, marginTop: 12 }]}>
                                <View style={styles.settingRow}>
                                     <View style={styles.settingInfo}>
                                         <TextComponent variant="body" bold color={theme.textPrimary}>
                                             Show Unmoderated Tours
                                         </TextComponent>
                                         <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                                             Allows pending review tours to be visible on the Explore and Map screens.
                                         </TextComponent>
                                     </View>
                                     <Switch
                                         value={showUnmoderatedTours}
                                         onValueChange={setShowUnmoderatedTours}
                                         trackColor={{ false: theme.bgInput, true: theme.primary }}
                                         thumbColor={Platform.OS === 'ios' ? '#fff' : (showUnmoderatedTours ? theme.primary : '#f4f3f4')}
                                     />
                                 </View>
                            </View>

                            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                Global Theme Settings
                            </TextComponent>

                            {/* Automatic Holiday Theme Toggle */}
                            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                <View style={styles.settingRow}>
                                     <View style={styles.settingInfo}>
                                         <TextComponent variant="body" bold color={theme.textPrimary}>
                                             Automatic Holiday Themes
                                         </TextComponent>
                                         <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                                             Automatically updates the global app theme on calendar holidays.
                                         </TextComponent>
                                     </View>
                                     <Switch
                                         value={autoThemeEnabled}
                                         onValueChange={setAutoThemeEnabled}
                                         trackColor={{ false: theme.bgInput, true: theme.primary }}
                                         thumbColor={Platform.OS === 'ios' ? '#fff' : (autoThemeEnabled ? theme.primary : '#f4f3f4')}
                                     />
                                 </View>
                            </View>

                            {/* Global Theme Override Selection */}
                            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.cardLabel}>
                                    GLOBAL HOLIDAY THEME OVERRIDE
                                </TextComponent>
                                <View style={{ height: 8 }} />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.presetCard,
                                            {
                                                backgroundColor: globalThemeOverride === null ? theme.primary : theme.bgPrimary,
                                                borderColor: globalThemeOverride === null ? 'transparent' : theme.borderPrimary,
                                                borderWidth: 1.5
                                            }
                                        ]}
                                        onPress={() => setGlobalThemeOverride(null)}
                                    >
                                        <TextComponent variant="caption" bold={globalThemeOverride === null} color={globalThemeOverride === null ? '#fff' : theme.textSecondary}>
                                            None (Auto Only)
                                        </TextComponent>
                                    </TouchableOpacity>
                                    {Object.keys(HOLIDAY_THEMES).map((key) => {
                                        const isActive = globalThemeOverride === key;
                                        return (
                                            <TouchableOpacity
                                                key={key}
                                                style={[
                                                    styles.presetCard,
                                                    {
                                                        backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                                        borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                                        borderWidth: 1.5
                                                    }
                                                ]}
                                                onPress={() => setGlobalThemeOverride(key)}
                                            >
                                                <TextComponent variant="caption" bold={isActive} color={isActive ? '#fff' : theme.textSecondary}>
                                                    {HOLIDAY_THEMES[key].translations?.[language]?.name || HOLIDAY_THEMES[key].name}
                                                </TextComponent>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>



                            <AnimatedPressable
                                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                                onPress={handleSaveSettings}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <TextComponent variant="body" bold color="#fff">
                                            Save Settings
                                        </TextComponent>
                                    </>
                                )}
                            </AnimatedPressable>
                        </View>
                    )}

                    {/* STATS TAB */}
                    {activeTab === 'stats' && (
                        <View style={styles.sectionContainer}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                System Statistics
                            </TextComponent>

                            {loadingStats ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color={theme.primary} />
                                </View>
                            ) : stats ? (
                                <>
                                    {/* System Stats Cards Grid */}
                                    <View style={styles.statsGrid}>
                                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                                            <Ionicons name="people-outline" size={24} color={theme.primary} />
                                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                                {stats.users}
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textSecondary}>
                                                Total Registered Users
                                            </TextComponent>
                                        </View>

                                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                                            <Ionicons name="map-outline" size={24} color={theme.accent} />
                                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                                {stats.tours}
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textSecondary}>
                                                Total Tours Created
                                            </TextComponent>
                                        </View>

                                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                                            <Ionicons name="game-controller-outline" size={24} color="#10b981" />
                                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                                {stats.activeSessions}
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textSecondary}>
                                                Active Sessions Play
                                            </TextComponent>
                                        </View>

                                        <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                                            <Ionicons name="ticket-outline" size={24} color="#f59e0b" />
                                            <TextComponent variant="h2" bold color={theme.textPrimary} style={styles.statsCount}>
                                                {stats.tokensPurchased}
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textSecondary}>
                                                In-App Tokens Purchased
                                            </TextComponent>
                                        </View>
                                    </View>

                                    <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                        Tour Moderation Breakdown
                                    </TextComponent>

                                    {/* Tour Status Breakdown Card */}
                                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                        {[
                                            { label: 'Published (Active)', value: stats.tourStatusCounts.PUBLISHED, color: 'green', icon: 'checkmark-circle-outline' },
                                            { label: 'Pending Review', value: stats.tourStatusCounts.PENDING_REVIEW, color: theme.accent, icon: 'time-outline' },
                                            { label: 'Draft', value: stats.tourStatusCounts.DRAFT, color: theme.textSecondary, icon: 'create-outline' },
                                            { label: 'Rejected', value: stats.tourStatusCounts.REJECTED, color: theme.danger, icon: 'close-circle-outline' },
                                        ].map((item, idx) => (
                                            <View key={item.label} style={[styles.statusRow, idx < 3 && { borderBottomColor: theme.borderPrimary, borderBottomWidth: 1 }]}>
                                                <View style={styles.statusRowLeft}>
                                                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                                                    <TextComponent variant="body" color={theme.textPrimary} style={{ marginLeft: 10 }}>
                                                        {item.label}
                                                    </TextComponent>
                                                </View>
                                                <TextComponent variant="body" bold color={theme.textPrimary}>
                                                    {item.value}
                                                </TextComponent>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <View style={styles.centerContainer}>
                                    <TextComponent variant="body" color={theme.textSecondary}>No statistics data loaded.</TextComponent>
                                </View>
                            )}
                        </View>
                    )}

                    {/* MODERATION TAB */}
                    {activeTab === 'moderation' && (
                        <View style={styles.sectionContainer}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                Tours Awaiting Review
                            </TextComponent>

                            {/* Search Bar */}
                            <View style={[styles.searchBarContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                                <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.searchBarInput, { color: theme.textPrimary }]}
                                    placeholder="Search tours by title, author, location..."
                                    placeholderTextColor={theme.textSecondary + '80'}
                                    value={moderationSearchQuery}
                                    onChangeText={setModerationSearchQuery}
                                />
                            </View>

                            {/* Sort Chips */}
                            <View style={styles.sortContainer}>
                                <TextComponent variant="caption" bold color={theme.textSecondary} style={{ marginRight: 8 }}>
                                    SORT:
                                </TextComponent>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false} 
                                    contentContainerStyle={styles.sortChipsScroll}
                                    style={{ marginBottom: 16 }}
                                >
                                    {[
                                        { label: 'Oldest First', value: 'oldest' },
                                        { label: 'Newest First', value: 'newest' },
                                        { label: 'Highest Points', value: 'points-desc' },
                                        { label: 'Longest Distance', value: 'distance-desc' },
                                    ].map((opt) => {
                                        const isActive = moderationSortOption === opt.value;
                                        return (
                                            <TouchableOpacity
                                                key={opt.value}
                                                style={[
                                                    styles.sortChip,
                                                    {
                                                        backgroundColor: isActive ? theme.primary : theme.bgSecondary,
                                                        borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                                        borderWidth: 1
                                                    }
                                                ]}
                                                onPress={() => setModerationSortOption(opt.value as any)}
                                            >
                                                <TextComponent
                                                    variant="caption"
                                                    bold={isActive}
                                                    color={isActive ? '#fff' : theme.textSecondary}
                                                >
                                                    {opt.label}
                                                </TextComponent>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {loadingPending ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />
                                </View>
                            ) : filteredAndSortedTours.length > 0 ? (
                                filteredAndSortedTours.map((tour) => (
                                    <View key={tour.id} style={[styles.tourCard, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                        <View style={styles.tourHeader}>
                                            <View style={styles.tourHeaderLeft}>
                                                <TextComponent variant="body" bold color={theme.textPrimary}>
                                                    {tour.title}
                                                </TextComponent>
                                                <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                                                    By {tour.author.name} • {tour.location}
                                                </TextComponent>
                                            </View>
                                            <TextComponent variant="caption" bold color={theme.accent}>
                                                {tour.points} pts
                                            </TextComponent>
                                        </View>

                                        <TextComponent variant="caption" color={theme.textSecondary} style={styles.tourDescription}>
                                            {tour.description || 'No description provided.'}
                                        </TextComponent>

                                        <View style={styles.tourStatsRow}>
                                            <TextComponent variant="caption" color={theme.textTertiary}>
                                                📏 {tour.distance.toFixed(2)} km
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textTertiary}>
                                                ⏱️ {tour.duration} mins
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textTertiary}>
                                                📅 {new Date(tour.createdAt).toLocaleDateString()}
                                            </TextComponent>
                                        </View>

                                        {/* Show/Hide Stops & Challenges */}
                                        <TouchableOpacity 
                                            style={[styles.detailsToggleBtn, { borderTopColor: theme.borderPrimary }]} 
                                            onPress={() => toggleTourExpand(tour.id)}
                                        >
                                            <TextComponent variant="caption" bold color={theme.primary}>
                                                {expandedTours[tour.id] ? 'Hide Stops & Challenges' : 'Show Stops & Challenges'}
                                            </TextComponent>
                                            <Ionicons 
                                                name={expandedTours[tour.id] ? "chevron-up" : "chevron-down"} 
                                                size={16} 
                                                color={theme.primary} 
                                                style={{ marginLeft: 4 }} 
                                            />
                                        </TouchableOpacity>

                                        {expandedTours[tour.id] && (
                                            <View style={[styles.detailsContainer, { backgroundColor: theme.bgPrimary }]}>
                                                {/* Global Challenges */}
                                                {tour.challenges && tour.challenges.length > 0 && (
                                                    <View style={styles.detailsSection}>
                                                        <TextComponent variant="caption" bold color={theme.textPrimary} style={styles.detailsSectionTitle}>
                                                            🌐 Global Tour Challenges
                                                        </TextComponent>
                                                        {tour.challenges.map((ch: ChallengeMetadata, idx: number) => (
                                                            <View key={ch.id} style={styles.detailItem}>
                                                                <TextComponent variant="caption" bold color={theme.textPrimary}>
                                                                    {idx + 1}. {ch.title} ({ch.type}) — {ch.points} pts
                                                                </TextComponent>
                                                                {ch.content && <TextComponent variant="caption" color={theme.textSecondary}>Q: {ch.content}</TextComponent>}
                                                                {ch.answer && <TextComponent variant="caption" color={theme.textSecondary} bold>A: {ch.answer}</TextComponent>}
                                                                {ch.hint && <TextComponent variant="caption" color={theme.textSecondary} style={{ fontStyle: 'italic' }}>Hint: {ch.hint}</TextComponent>}
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}

                                                {/* Stops */}
                                                {tour.stops && tour.stops.length > 0 ? (
                                                    <View style={styles.detailsSection}>
                                                        <TextComponent variant="caption" bold color={theme.textPrimary} style={styles.detailsSectionTitle}>
                                                            📍 Tour Stops ({tour.stops.length})
                                                        </TextComponent>
                                                        {tour.stops.map((stop: StopMetadata) => (
                                                            <View key={stop.id} style={styles.stopDetailItem}>
                                                                <TextComponent variant="caption" bold color={theme.textPrimary}>
                                                                    Stop {stop.number}: {stop.name} ({stop.type})
                                                                </TextComponent>
                                                                <TextComponent variant="caption" color={theme.textSecondary}>{stop.description}</TextComponent>
                                                                <TextComponent variant="caption" color={theme.textTertiary} style={{ fontSize: 10 }}>
                                                                    Coords: {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                                                                </TextComponent>

                                                                {/* Stop Challenges */}
                                                                {stop.challenges && stop.challenges.length > 0 && (
                                                                    <View style={{ marginLeft: 12, marginTop: 6 }}>
                                                                        {stop.challenges.map((ch: ChallengeMetadata, cIdx: number) => (
                                                                            <View key={ch.id} style={{ marginBottom: 4 }}>
                                                                                <TextComponent variant="caption" bold color={theme.textSecondary}>
                                                                                    🎯 Challenge {cIdx + 1}: {ch.title} ({ch.type}) — {ch.points} pts
                                                                                </TextComponent>
                                                                                {ch.content && <TextComponent variant="caption" color={theme.textSecondary}>Q: {ch.content}</TextComponent>}
                                                                                {ch.answer && <TextComponent variant="caption" color={theme.textSecondary} bold>A: {ch.answer}</TextComponent>}
                                                                                {ch.hint && <TextComponent variant="caption" color={theme.textSecondary} style={{ fontStyle: 'italic' }}>Hint: {ch.hint}</TextComponent>}
                                                                            </View>
                                                                        ))}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <TextComponent variant="caption" color={theme.textSecondary}>No stops found.</TextComponent>
                                                )}
                                            </View>
                                        )}

                                        <View style={styles.moderationActions}>
                                            <TouchableOpacity
                                                style={[styles.moderationBtn, { backgroundColor: theme.danger + '20', borderColor: theme.danger, borderWidth: 1 }]}
                                                onPress={() => openRejectionPrompt(tour.id)}
                                                disabled={moderatingAction !== null}
                                            >
                                                {moderatingAction?.id === tour.id && moderatingAction?.action === 'reject' ? (
                                                    <ActivityIndicator size="small" color={theme.danger} />
                                                ) : (
                                                    <>
                                                        <Ionicons name="close" size={16} color={theme.danger} style={{ marginRight: 6 }} />
                                                        <TextComponent variant="caption" bold color={theme.danger}>
                                                            Reject
                                                        </TextComponent>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.moderationBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary, borderWidth: 1 }]}
                                                onPress={() => handleModerateTour(tour.id, 'PUBLISHED')}
                                                disabled={moderatingAction !== null}
                                            >
                                                {moderatingAction?.id === tour.id && moderatingAction?.action === 'approve' ? (
                                                    <ActivityIndicator size="small" color={theme.primary} />
                                                ) : (
                                                    <>
                                                        <Ionicons name="checkmark" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                                                        <TextComponent variant="caption" bold color={theme.primary}>
                                                            Approve
                                                        </TextComponent>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                             ) : (
                                <View style={styles.emptyModerationCard}>
                                    <Ionicons 
                                        name={moderationSearchQuery ? "search-outline" : "checkmark-done"} 
                                        size={48} 
                                        color={moderationSearchQuery ? theme.textTertiary : "green"} 
                                    />
                                    <TextComponent variant="body" bold color={theme.textPrimary} style={{ marginTop: 12 }}>
                                        {moderationSearchQuery ? "No Matching Tours" : "All Tours Moderated"}
                                    </TextComponent>
                                    <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 6, textAlign: 'center' }}>
                                        {moderationSearchQuery 
                                            ? "Try adjusting your search query to find matching pending tours." 
                                            : "There are currently no custom tours awaiting administrative review."
                                        }
                                    </TextComponent>
                                </View>
                             )}
                        </View>
                    )}

                    {/* USERS MANAGEMENT TAB */}
                    {activeTab === 'users' && (
                        <View style={styles.sectionContainer}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                User Management
                            </TextComponent>

                            {/* Search Bar */}
                            <View style={[styles.searchBarContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                                <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.searchBarInput, { color: theme.textPrimary }]}
                                    placeholder="Search users by name/email..."
                                    placeholderTextColor={theme.textSecondary + '80'}
                                    value={userSearchQuery}
                                    onChangeText={(txt) => {
                                        setUserSearchQuery(txt);
                                        fetchUsers(txt);
                                    }}
                                />
                            </View>

                            {loadingUsers ? (
                                <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 24 }} />
                            ) : usersList.length > 0 ? (
                                usersList.map((usr) => (
                                    <View key={usr.id} style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                        {editingUserId === usr.id ? (
                                            <View style={styles.editUserForm}>
                                                <TextComponent variant="caption" bold color={theme.primary} style={{ marginBottom: 12 }}>
                                                    EDIT USER PROFILE
                                                </TextComponent>
                                                
                                                <View style={styles.inputGroup}>
                                                    <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                                        NAME
                                                    </TextComponent>
                                                    <TextInput
                                                        style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                                        value={editName}
                                                        onChangeText={setEditName}
                                                        placeholder="Name"
                                                        placeholderTextColor={theme.textSecondary + '80'}
                                                    />
                                                </View>

                                                <View style={styles.inputGroup}>
                                                    <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                                        EMAIL
                                                    </TextComponent>
                                                    <TextInput
                                                        style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                                        value={editEmail}
                                                        onChangeText={setEditEmail}
                                                        placeholder="Email"
                                                        placeholderTextColor={theme.textSecondary + '80'}
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                    />
                                                </View>

                                                <View style={styles.rowInputs}>
                                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                                            TOKENS
                                                        </TextComponent>
                                                        <TextInput
                                                            style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                                            value={editTokens}
                                                            onChangeText={setEditTokens}
                                                            placeholder="Tokens"
                                                            placeholderTextColor={theme.textSecondary + '80'}
                                                            keyboardType="numeric"
                                                        />
                                                    </View>

                                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                                            XP
                                                        </TextComponent>
                                                        <TextInput
                                                            style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                                            value={editXp}
                                                            onChangeText={setEditXp}
                                                            placeholder="XP"
                                                            placeholderTextColor={theme.textSecondary + '80'}
                                                            keyboardType="numeric"
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.inputGroup}>
                                                    <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                                        CUSTOM COLOR THEME
                                                    </TextComponent>
                                                    <View style={{ height: 8 }} />
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.presetCard,
                                                                {
                                                                    backgroundColor: editCustomTheme === null ? theme.primary : theme.bgPrimary,
                                                                    borderColor: editCustomTheme === null ? 'transparent' : theme.borderPrimary,
                                                                    borderWidth: 1.5
                                                                }
                                                            ]}
                                                            onPress={() => setEditCustomTheme(null)}
                                                        >
                                                            <TextComponent variant="caption" bold={editCustomTheme === null} color={editCustomTheme === null ? '#fff' : theme.textSecondary}>
                                                                Default
                                                            </TextComponent>
                                                        </TouchableOpacity>
                                                        {COLOR_THEMES.map((t) => {
                                                            const isActive = editCustomTheme === t.id;
                                                            return (
                                                                <TouchableOpacity
                                                                    key={t.id}
                                                                    style={[
                                                                        styles.presetCard,
                                                                        {
                                                                            backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                                                            borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                                                            borderWidth: 1.5
                                                                        }
                                                                    ]}
                                                                    onPress={() => setEditCustomTheme(t.id)}
                                                                >
                                                                    <TextComponent variant="caption" bold={isActive} color={isActive ? '#fff' : theme.textSecondary}>
                                                                        {t.name}
                                                                    </TextComponent>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </ScrollView>
                                                </View>

                                                <View style={styles.formActions}>
                                                    <TouchableOpacity
                                                        style={[styles.formActionBtn, { borderColor: theme.borderPrimary, borderWidth: 1 }]}
                                                        onPress={() => setEditingUserId(null)}
                                                        disabled={savingUser}
                                                    >
                                                        <TextComponent variant="caption" bold color={theme.textSecondary}>
                                                            Cancel
                                                        </TextComponent>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={[styles.formActionBtn, { backgroundColor: theme.primary }]}
                                                        onPress={handleSaveUser}
                                                        disabled={savingUser}
                                                    >
                                                        {savingUser ? (
                                                            <ActivityIndicator size="small" color="#fff" />
                                                        ) : (
                                                            <TextComponent variant="caption" bold color="#fff">
                                                                Save
                                                            </TextComponent>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <>
                                                <View style={styles.userCardHeader}>
                                                    <View style={{ flex: 1 }}>
                                                        <TextComponent variant="body" bold color={theme.textPrimary}>
                                                            {usr.name} {usr.isAdmin && <TextComponent variant="caption" bold color={theme.danger}>[Admin]</TextComponent>}
                                                        </TextComponent>
                                                        <TextComponent variant="caption" color={theme.textSecondary}>
                                                            {usr.email || 'No email registered'}
                                                        </TextComponent>
                                                        <TextComponent variant="caption" color={theme.textTertiary} style={{ marginTop: 4 }}>
                                                            Joined: {new Date(usr.createdAt).toLocaleDateString()} • XP: {usr.xp} • Tokens: {usr.tokens ?? 0}
                                                        </TextComponent>
                                                    </View>
                                                    <View style={styles.userStatsBox}>
                                                        <TextComponent variant="caption" bold color={theme.textSecondary}>
                                                            🛠️ {usr._count.createdTours} | 🎮 {usr._count.playedTours} | 💬 {usr._count.reviews}
                                                        </TextComponent>
                                                    </View>
                                                </View>
                                                <View style={[styles.userCardActions, { borderTopWidth: 1, borderTopColor: theme.borderPrimary }]}>
                                                    <TouchableOpacity
                                                        style={[styles.userActionBtn, { backgroundColor: theme.danger + '10', borderColor: theme.danger, borderWidth: 1 }]}
                                                        onPress={() => handleDeleteUser(usr.id, usr.name)}
                                                        disabled={deletingUserId !== null || usr.id === user?.id || togglingAdminId !== null}
                                                    >
                                                        {deletingUserId === usr.id ? (
                                                            <ActivityIndicator size="small" color={theme.danger} />
                                                        ) : (
                                                            <TextComponent variant="caption" bold color={theme.danger}>
                                                                Delete
                                                            </TextComponent>
                                                        )}
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={[styles.userActionBtn, { borderColor: theme.primary, borderWidth: 1 }]}
                                                        onPress={() => handleToggleUserAdmin(usr.id, usr.isAdmin)}
                                                        disabled={togglingAdminId !== null || usr.id === user?.id || deletingUserId !== null}
                                                    >
                                                        {togglingAdminId === usr.id ? (
                                                            <ActivityIndicator size="small" color={theme.primary} />
                                                        ) : (
                                                            <TextComponent variant="caption" bold color={theme.primary}>
                                                                {usr.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                                                            </TextComponent>
                                                        )}
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={[styles.userActionBtn, { borderColor: theme.primary, borderWidth: 1 }]}
                                                        onPress={() => startEditingUser(usr)}
                                                        disabled={savingUser || togglingAdminId !== null || deletingUserId !== null}
                                                    >
                                                        <TextComponent variant="caption" bold color={theme.primary}>
                                                            Edit
                                                        </TextComponent>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.centerContainer}>
                                    <TextComponent variant="body" color={theme.textSecondary}>No users found.</TextComponent>
                                </View>
                            )}
                        </View>
                    )}

                    {/* REVIEWS MANAGEMENT TAB */}
                    {activeTab === 'reviews' && (
                        <View style={styles.sectionContainer}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                                Review Moderation
                            </TextComponent>

                            {/* Search Bar */}
                            <View style={[styles.searchBarContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                                <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.searchBarInput, { color: theme.textPrimary }]}
                                    placeholder="Search reviews by content, tour, user..."
                                    placeholderTextColor={theme.textSecondary + '80'}
                                    value={reviewSearchQuery}
                                    onChangeText={(txt) => {
                                        setReviewSearchQuery(txt);
                                        fetchReviews(txt);
                                    }}
                                />
                            </View>

                            {loadingReviews ? (
                                <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 24 }} />
                            ) : reviewsList.length > 0 ? (
                                reviewsList.map((rev) => (
                                    <View key={rev.id} style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                                        <View style={styles.reviewHeader}>
                                            <View style={{ flex: 1 }}>
                                                <TextComponent variant="caption" bold color={theme.primary}>
                                                    {rev.tour.title}
                                                </TextComponent>
                                                <TextComponent variant="caption" color={theme.textSecondary}>
                                                    By {rev.author.name} • {new Date(rev.createdAt).toLocaleDateString()}
                                                </TextComponent>
                                            </View>
                                            <View style={styles.ratingStars}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Ionicons
                                                        key={i}
                                                        name={i < rev.rating ? "star" : "star-outline"}
                                                        size={14}
                                                        color={i < rev.rating ? "#FFC107" : theme.textTertiary}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        <TextComponent variant="body" color={theme.textPrimary} style={{ marginVertical: 10 }}>
                                            "{rev.content}"
                                        </TextComponent>
                                        <View style={[styles.userCardActions, { borderTopWidth: 1, borderTopColor: theme.borderPrimary, justifyContent: 'flex-start' }]}>
                                            <TouchableOpacity
                                                style={[styles.userActionBtn, { backgroundColor: theme.danger + '10', borderColor: theme.danger, borderWidth: 1, maxWidth: 120 }]}
                                                onPress={() => handleDeleteReview(rev.id)}
                                                disabled={deletingReviewId !== null}
                                            >
                                                {deletingReviewId === rev.id ? (
                                                    <ActivityIndicator size="small" color={theme.danger} />
                                                ) : (
                                                    <TextComponent variant="caption" bold color={theme.danger}>
                                                        Delete Review
                                                    </TextComponent>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.centerContainer}>
                                    <TextComponent variant="body" color={theme.textSecondary}>No reviews found.</TextComponent>
                                </View>
                            )}
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
            </>
            )}

            {/* Rejection Prompt Modal */}
            <Modal
                visible={rejectionModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRejectionModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20
                    }}>
                        <View style={{
                            width: '100%',
                            maxWidth: 400,
                            backgroundColor: theme.bgSecondary,
                            borderRadius: 24,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            elevation: 10
                        }}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={{ marginBottom: 8 }}>
                                Reason for Rejection
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary} style={{ marginBottom: 16 }}>
                                Please explain why this tour is being rejected. The creator will be notified of this reason.
                            </TextComponent>
                            <TextInput
                                style={{
                                    backgroundColor: theme.bgPrimary,
                                    color: theme.textPrimary,
                                    borderRadius: 16,
                                    padding: 16,
                                    height: 120,
                                    textAlignVertical: 'top',
                                    borderWidth: 1,
                                    borderColor: theme.borderPrimary,
                                    marginBottom: 24,
                                    fontSize: 14
                                }}
                                placeholder="e.g. Inappropriate language, invalid locations, low quality stops..."
                                placeholderTextColor={theme.textSecondary + '80'}
                                multiline={true}
                                value={rejectionReasonText}
                                onChangeText={setRejectionReasonText}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                                <TouchableOpacity
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 12,
                                        borderRadius: 30,
                                        borderWidth: 1,
                                        borderColor: theme.borderPrimary
                                    }}
                                    onPress={() => setRejectionModalVisible(false)}
                                >
                                    <TextComponent variant="caption" bold color={theme.textSecondary}>
                                        Cancel
                                    </TextComponent>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 12,
                                        borderRadius: 30,
                                        backgroundColor: theme.primary
                                    }}
                                    onPress={handleConfirmRejection}
                                >
                                    <TextComponent variant="caption" bold color="#fff">
                                        Reject Tour
                                    </TextComponent>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 160,
    },
    tabScrollView: {
        borderRadius: 14,
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        flexGrow: 0,
    },
    tabScrollContent: {
        flexDirection: 'row',
        padding: 4,
        gap: 4,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    sectionContainer: {
        marginTop: 16,
    },
    sectionHeading: {
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardLabel: {
        marginBottom: 14,
        letterSpacing: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    quickDates: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-start',
    },
    presetCard: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    calendarMonthNav: {
        padding: 6,
        borderRadius: 10,
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekDayHeader: {
        width: `${100 / 7}%`,
        textAlign: 'center',
        fontSize: 11,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDayCell: {
        width: `${100 / 7}%`,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginVertical: 2,
        position: 'relative',
    },
    calendarDayCellEmpty: {
        width: `${100 / 7}%`,
        height: 40,
    },
    calendarDayCellDisabled: {
        opacity: 0.4,
    },
    todayIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        marginBottom: 24,
    },
    saveButton: {
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statsCard: {
        width: '48%',
        borderRadius: 20,
        padding: 16,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        height: 125,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statsCount: {
        fontSize: 28,
        marginTop: 10,
        marginBottom: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    statusRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tourCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tourHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    tourHeaderLeft: {
        flex: 1,
        marginRight: 10,
    },
    tourDescription: {
        marginTop: 10,
        lineHeight: 18,
    },
    tourStatsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // space holder
        paddingBottom: 12,
    },
    moderationActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 10,
    },
    moderationBtn: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyModerationCard: {
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#10b98140',
        marginTop: 8,
    },
    detailsToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        borderTopWidth: 1,
    },
    detailsContainer: {
        borderRadius: 14,
        padding: 12,
        marginTop: 6,
        marginBottom: 12,
    },
    detailsSection: {
        marginBottom: 12,
    },
    detailsSectionTitle: {
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailItem: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
        marginBottom: 6,
    },
    stopDetailItem: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
        marginBottom: 8,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 16,
    },
    searchBarInput: {
        flex: 1,
        fontSize: 14,
        height: '100%',
    },
    userCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    userStatsBox: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    userCardActions: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 12,
        marginTop: 8,
    },
    userActionBtn: {
        flex: 1,
        height: 38,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    ratingStars: {
        flexDirection: 'row',
        gap: 2,
    },
    editUserForm: {
        gap: 12,
    },
    inputGroup: {
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 10,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    formInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 8,
    },
    formActionBtn: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sortChipsScroll: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        paddingLeft: 4,
    },
    sortChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    notificationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 2,
        borderRadius: 12,
        borderWidth: 1,
    }
});
