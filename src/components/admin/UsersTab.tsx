import React from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextComponent } from '../common/TextComponent';
import { adminStyles as styles } from './adminStyles';
import { COLOR_THEMES } from '../../constants/themes';
import { useLanguage } from '../../context/LanguageContext';

interface UsersTabProps {
    adminState: {
        theme: any;
        userSearchQuery: string;
        setUserSearchQuery: (val: string) => void;
        fetchUsers: (txt: string) => Promise<void>;
        loadingUsers: boolean;
        usersList: any[];
        editingUserId: number | null;
        setEditingUserId: (val: number | null) => void;
        editName: string;
        setEditName: (val: string) => void;
        editEmail: string;
        setEditEmail: (val: string) => void;
        editTokens: string;
        setEditTokens: (val: string) => void;
        editXp: string;
        setEditXp: (val: string) => void;
        editCustomTheme: string | null;
        setEditCustomTheme: (val: string | null) => void;
        savingUser: boolean;
        handleSaveUser: () => Promise<void>;
        handleDeleteUser: (id: number, name: string) => Promise<void>;
        handleToggleUserAdmin: (id: number, isAdmin: boolean) => Promise<void>;
        startEditingUser: (usr: any) => void;
        deletingUserId: number | null;
        togglingAdminId: number | null;
    };
    currentUser: { id: number } | null;
}

export function UsersTab({ adminState, currentUser }: UsersTabProps) {
    const { t } = useLanguage();
    const {
        theme,
        userSearchQuery,
        setUserSearchQuery,
        fetchUsers,
        loadingUsers,
        usersList,
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
        handleSaveUser,
        handleDeleteUser,
        handleToggleUserAdmin,
        startEditingUser,
        deletingUserId,
        togglingAdminId
    } = adminState;

    return (
        <View style={styles.sectionContainer}>
            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                {t('userManagement')}
            </TextComponent>

            {/* Search Bar */}
            <View style={[styles.searchBarContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                     style={[styles.searchBarInput, { color: theme.textPrimary }]}
                     placeholder={t('searchUsersPlaceholder')}
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
                                    {t('editUserProfile')}
                                </TextComponent>

                                <View style={styles.inputGroup}>
                                    <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                        {t('name').toUpperCase()}
                                    </TextComponent>
                                    <TextInput
                                        style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                        value={editName}
                                        onChangeText={setEditName}
                                        placeholder={t('name')}
                                        placeholderTextColor={theme.textSecondary + '80'}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                        {t('email').toUpperCase()}
                                    </TextComponent>
                                    <TextInput
                                        style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                        value={editEmail}
                                        onChangeText={setEditEmail}
                                        placeholder={t('email')}
                                        placeholderTextColor={theme.textSecondary + '80'}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.rowInputs}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                            {t('tokens').toUpperCase()}
                                        </TextComponent>
                                        <TextInput
                                            style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                            value={editTokens}
                                            onChangeText={setEditTokens}
                                            placeholder={t('tokens')}
                                            placeholderTextColor={theme.textSecondary + '80'}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                            {t('xp').toUpperCase()}
                                        </TextComponent>
                                        <TextInput
                                            style={[styles.formInput, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                                            value={editXp}
                                            onChangeText={setEditXp}
                                            placeholder={t('xp')}
                                            placeholderTextColor={theme.textSecondary + '80'}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.inputLabel}>
                                        {t('customColorTheme')}
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
                                            <TextComponent variant="caption" bold={editCustomTheme === null} color={editCustomTheme === null ? theme.textOnPrimary : theme.textSecondary}>
                                                {t('indefinite')}
                                            </TextComponent>
                                        </TouchableOpacity>
                                        {COLOR_THEMES.map((tTheme) => {
                                            const isActive = editCustomTheme === tTheme.id;
                                            return (
                                                <TouchableOpacity
                                                    key={tTheme.id}
                                                    style={[
                                                        styles.presetCard,
                                                        {
                                                            backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                                            borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                                            borderWidth: 1.5
                                                        }
                                                    ]}
                                                    onPress={() => setEditCustomTheme(tTheme.id)}
                                                >
                                                    <TextComponent variant="caption" bold={isActive} color={isActive ? theme.textOnPrimary : theme.textSecondary}>
                                                        {tTheme.name}
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
                                            {t('cancel')}
                                        </TextComponent>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.formActionBtn, { backgroundColor: theme.primary }]}
                                        onPress={handleSaveUser}
                                        disabled={savingUser}
                                    >
                                        {savingUser ? (
                                            <ActivityIndicator size="small" color={theme.textOnPrimary} />
                                        ) : (
                                            <TextComponent variant="caption" bold color={theme.textOnPrimary}>
                                                {t('save')}
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
                                            {usr.name} {usr.isAdmin && <TextComponent variant="caption" bold color={theme.danger}>[{t('admin') || 'Admin'}]</TextComponent>}
                                        </TextComponent>
                                        <TextComponent variant="caption" color={theme.textSecondary}>
                                            {usr.email || t('noEmailRegistered') || 'No email registered'}
                                        </TextComponent>
                                        <TextComponent variant="caption" color={theme.textTertiary} style={{ marginTop: 4 }}>
                                            {t('joined') || 'Joined'}: {new Date(usr.createdAt).toLocaleDateString()} • {t('xp')}: {usr.xp} • {t('tokens')}: {usr.tokens ?? 0}
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
                                        disabled={deletingUserId !== null || usr.id === currentUser?.id || togglingAdminId !== null}
                                    >
                                        {deletingUserId === usr.id ? (
                                            <ActivityIndicator size="small" color={theme.danger} />
                                        ) : (
                                            <TextComponent variant="caption" bold color={theme.danger}>
                                                {t('delete')}
                                            </TextComponent>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.userActionBtn, { borderColor: theme.primary, borderWidth: 1 }]}
                                        onPress={() => handleToggleUserAdmin(usr.id, usr.isAdmin)}
                                        disabled={togglingAdminId !== null || usr.id === currentUser?.id || deletingUserId !== null}
                                    >
                                        {togglingAdminId === usr.id ? (
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        ) : (
                                            <TextComponent variant="caption" bold color={theme.primary}>
                                                {usr.isAdmin ? t('revokeAdmin') : t('grantAdmin')}
                                            </TextComponent>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.userActionBtn, { borderColor: theme.primary, borderWidth: 1 }]}
                                        onPress={() => startEditingUser(usr)}
                                        disabled={savingUser || togglingAdminId !== null || deletingUserId !== null}
                                    >
                                        <TextComponent variant="caption" bold color={theme.primary}>
                                            {t('edit')}
                                        </TextComponent>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                ))
            ) : (
                <View style={styles.centerContainer}>
                    <TextComponent variant="body" color={theme.textSecondary}>{t('noUsersFound')}</TextComponent>
                </View>
            )}
        </View>
    );
}
