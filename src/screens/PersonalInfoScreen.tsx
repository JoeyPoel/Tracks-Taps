import { ImageUploader } from '@/src/components/common/ImageUploader';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserContext } from '@/src/context/UserContext';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    View
} from 'react-native';
import AppHeader from '../components/Header';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
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

    const renderSectionHeader = (title: string, icon: string) => (
        <View style={styles.sectionHeader}>
            <LinearGradient
                colors={[theme.accent + '20', theme.primary + '20']}
                style={styles.sectionIconContainer}
            >
                <Ionicons name={icon as any} size={18} color={theme.primary} />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
        </View>
    );

    if (!authUser) {
        return (
            <ScreenWrapper>
                <View style={[styles.centerContainer]}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                        {t('loginRequired')}
                    </Text>
                    <Text style={[styles.message, { color: theme.textSecondary }]}>
                        {t('pleaseLoginToManageYourPersonalDetails')}
                    </Text>
                    <AnimatedPressable
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.buttonText}>{t('login')}</Text>
                    </AnimatedPressable>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Stack.Screen options={{ headerShown: false }} />

            <AppHeader
                showBackButton
                title={t('personalInfo')}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <ImageUploader
                            label={t('profilePicture')}
                            initialImage={avatarUrl}
                            onUploadComplete={setAvatarUrl}
                            folder="avatars"
                            variant="avatar"
                            placeholder={t('takePhoto')}
                        />
                    </View>

                    {/* Basic Info Section */}
                    {renderSectionHeader(t('personalInfo'), 'person-outline')}
                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('name')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.borderPrimary }]}>
                                <Ionicons name="person-circle-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder={t('name')}
                                    placeholderTextColor={theme.textSecondary + '80'}
                                />
                            </View>
                        </View>

                        <View style={[styles.formGroup, { marginBottom: 0 }]}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('email')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.borderPrimary }]}>
                                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder={t('email')}
                                    placeholderTextColor={theme.textSecondary + '80'}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <Text style={[styles.hint, { color: theme.textTertiary }]}>
                                {t('emailChangeNotice')}
                            </Text>
                        </View>
                    </View>

                    {/* Security Section */}
                    {renderSectionHeader(t('security'), 'lock-closed-outline')}
                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        <View style={[styles.formGroup, { marginBottom: 0 }]}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('password')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.borderPrimary }]}>
                                <Ionicons name="key-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="• • • • • • • •"
                                    placeholderTextColor={theme.textSecondary + '80'}
                                    secureTextEntry
                                />
                            </View>
                            <Text style={[styles.hint, { color: theme.textTertiary }]}>
                                {t('passwordHint')}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionContainer}>
                        <AnimatedPressable
                            style={[styles.button, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('saveChanges')}</Text>
                            )}
                        </AnimatedPressable>

                        <AnimatedPressable
                            style={[styles.logoutButton, { borderColor: theme.danger + '40', backgroundColor: theme.danger + '10' }]}
                            onPress={handleLogout}
                            disabled={loading}
                        >
                            <Text style={[styles.logoutText, { color: theme.danger }]}>{t('logout')}</Text>
                        </AnimatedPressable>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 20,
        marginBottom: 24,
        padding: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
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
        marginTop: 6,
        marginLeft: 4,
    },
    actionContainer: {
        marginTop: 8,
        gap: 16,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
