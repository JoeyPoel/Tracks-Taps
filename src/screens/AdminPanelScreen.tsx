import React from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent';
import { useAdminState } from '../hooks/useAdminState';
import { adminStyles as styles } from '../components/admin/adminStyles';

import { SettingsTab } from '../components/admin/SettingsTab';
import { StatsTab } from '../components/admin/StatsTab';
import { ModerationTab } from '../components/admin/ModerationTab';
import { UsersTab } from '../components/admin/UsersTab';
import { ReviewsTab } from '../components/admin/ReviewsTab';
import { useUserContext } from '../context/UserContext';

export default function AdminPanelScreen() {
    const adminState = useAdminState();
    const { user } = useUserContext();
    const { theme, activeTab, setActiveTab, loading, stats } = adminState;

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
                                    color={activeTab === tab ? theme.textOnPrimary : theme.textSecondary}
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
                            {activeTab === 'settings' && <SettingsTab adminState={adminState} />}
                            {activeTab === 'stats' && <StatsTab adminState={adminState} />}
                            {activeTab === 'moderation' && <ModerationTab adminState={adminState} />}
                            {activeTab === 'users' && <UsersTab adminState={adminState} currentUser={user} />}
                            {activeTab === 'reviews' && <ReviewsTab adminState={adminState} />}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </>
            )}
        </ScreenWrapper>
    );
}
