import { ImageUploader } from '@/src/components/common/ImageUploader';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserContext } from '@/src/context/UserContext';
import { supabase } from '@/utils/supabase';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import AppHeader from '../components/Header';
import { ScreenWrapper } from '../components/common/ScreenWrapper';

export default function PersonalInfoScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const { signOut, user: authUser } = useAuth();
    const { user: dbUser, updateUser } = useUserContext();

    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dbUser) {
            setName(dbUser.name || '');
            setAvatarUrl(dbUser.avatarUrl || '');
            setEmail(dbUser.email || '');
        } else if (authUser) {
            setEmail(authUser.email || '');
        }
    }, [dbUser, authUser]);



    const handleSave = async () => {
        setLoading(true);
        try {
            // Update Supabase Auth (Email/Password)
            const updates: { email?: string; password?: string } = {};
            if (email !== authUser?.email) updates.email = email;
            if (password) updates.password = password;

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase.auth.updateUser(updates);
                if (error) throw error;
            }

            // Update Database User (Name, Avatar)
            if (dbUser) {
                await updateUser(dbUser.id, {
                    name,
                    avatarUrl,
                });
            }

            Alert.alert(t('reviewSubmittedTitle'), t('updateSuccess'));
            setPassword(''); // Clear password field    
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert(t('error'), error.message || t('updateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await signOut();
            router.replace('/(tabs)/profile');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!authUser) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', padding: 24 }]}>
                <Text style={[styles.title, { color: theme.textPrimary, textAlign: 'center' }]}>
                    {t('loginRequired')}
                </Text>
                <Text style={[styles.message, { color: theme.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                    {t('pleaseLoginToManageYourPersonalDetails')}
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={styles.buttonText}>{t('login')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScreenWrapper animateEntry={false} includeTop={false} includeBottom={false}>
            <Stack.Screen options={{ headerShown: false }} />

            <AppHeader
                showBackButton
                title={t('personalInfo')}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <ImageUploader
                            label={t('profilePicture')}
                            initialImage={avatarUrl}
                            onUploadComplete={setAvatarUrl}
                            folder="avatars"
                            variant="avatar"
                            placeholder={t('takePhoto')}
                        />
                    </View>

                    {/* Name */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('name')}</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('name')}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('email')}</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('email')}
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <Text style={[styles.hint, { color: theme.textSecondary }]}>
                            Changing email may require re-verification.
                        </Text>
                    </View>

                    {/* Password */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('password')}</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={password}
                                onChangeText={setPassword}
                                placeholder={t('password')}
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                            />
                        </View>
                        <Text style={[styles.hint, { color: theme.textSecondary }]}>
                            Leave blank to keep current password.
                        </Text>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary, marginTop: 20 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{t('saveChanges')}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: theme.danger }]}
                        onPress={handleLogout}
                        disabled={loading}
                    >
                        <Text style={[styles.logoutText, { color: theme.danger }]}>{t('logout')}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        marginBottom: 16,
    },
    avatarInputContainer: {
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        height: 50,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
