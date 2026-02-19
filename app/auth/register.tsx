import { FormInput } from '@/src/components/common/FormInput';
import SocialButton from '@/src/components/SocialButton';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/authService';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';



export default function RegisterScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingType, setLoadingType] = useState<'register' | 'google' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);


    React.useEffect(() => {
        AuthService.configureGoogle();
    }, []);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', t('enterEmail') + ', ' + t('enterPassword'));
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', t('passwordsDoNotMatch'));
            return;
        }

        if (!termsAccepted) {
            Alert.alert('Error', t('mustAcceptTerms' as any) || "You must accept the Terms and Conditions to sign up.");
            return;
        }

        setLoadingType('register');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: Platform.select({
                    web: window.location.origin + '/auth/confirm-email',
                    default: undefined
                }),
            }
        });
        setLoadingType(null);

        if (error) {
            Alert.alert(t('failedToRegister'), error.message);
        } else if (!data.session) {
            // Session is null -> Email verification is enabled and required
            Alert.alert(t('checkEmailToVerify'));
            router.replace('/auth/login');
        } else {
            // User is created in Supabase and logged in. Now create in our DB explicitly.
            try {
                const session = data.session;
                await fetch(process.env.EXPO_PUBLIC_API_URL + '/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ action: 'create-user', email: email }),
                });
            } catch (err) {
                console.error("Failed to create user in DB:", err);
                // We don't block the user flow here because the checkout/login will likely retry or "lazy create"
            }
        }
        // If data.session exists, the user is logged in automatically. 
        // The AuthContext listener will detect the session change and redirect to the main app.
    };

    const handleGoogleLogin = async () => {
        setLoadingType('google');
        const data = await AuthService.signInWithGoogle();
        setLoadingType(null);
        if (data?.session) {
            // Logged in
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Section matching Onboarding */}
                    <View style={styles.header}>


                        <Animated.Text
                            entering={FadeInDown.delay(400).springify()}
                            style={[styles.title, { color: theme.textPrimary }]}
                        >
                            {t('createAccount')}
                        </Animated.Text>

                        <Animated.Text
                            entering={FadeInDown.delay(600).springify()}
                            style={[styles.subtitle, { color: theme.textSecondary }]}
                        >
                            {t('registerSubtitle')}
                        </Animated.Text>
                    </View>

                    {/* Form Section */}
                    <Animated.View
                        entering={FadeInDown.delay(800).springify()}
                        style={styles.form}
                    >
                        <View style={styles.inputContainer}>
                            <FormInput
                                label={t('email')}
                                value={email}
                                onChange={setEmail}
                                placeholder={t('enterEmail')}
                                keyboardType="email-address"
                                maxLength={254}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('password')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.borderInput }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder={t('enterPassword')}
                                    placeholderTextColor={theme.textTertiary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}

                                    maxLength={100}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textTertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('confirmPassword')}</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.borderInput }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder={t('confirmPassword')}
                                    placeholderTextColor={theme.textTertiary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}

                                    maxLength={100}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textTertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, { borderColor: termsAccepted ? theme.primary : theme.textTertiary }]}
                                onPress={() => setTermsAccepted(!termsAccepted)}
                            >
                                {termsAccepted && <Ionicons name="checkmark" size={14} color={theme.primary} />}
                            </TouchableOpacity>
                            <View style={styles.termsTextContainer}>
                                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                                    {t('iAgreeTo' as any) || 'I agree to the'} <Text style={[styles.termsLink, { color: theme.primary }]} onPress={() => router.push('/auth/terms' as any)}>{t('termsAndConditions' as any) || 'Terms & Conditions'}</Text>
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.primary }]}
                            onPress={handleRegister}
                            disabled={!!loadingType}
                        >
                            {loadingType === 'register' ? (
                                <ActivityIndicator color={theme.textOnPrimary} />
                            ) : (
                                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>{t('signUp')}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.borderPrimary }]} />
                            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>{t('or')}</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.borderPrimary }]} />
                        </View>

                        <SocialButton
                            text={t('googleSignIn')}
                            onPress={handleGoogleLogin}
                            icon="google"
                            loading={loadingType === 'google'}
                        />

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>{t('haveAccount')} </Text>
                            <Link href="/auth/login" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.link, { color: theme.primary }]}>{t('signIn')}</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)/explore')}
                            style={{ alignSelf: 'center', marginTop: 24, padding: 8 }}
                        >
                            <Text style={{ color: theme.textTertiary, fontSize: 14 }}>
                                {t('continueAsGuest')}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },

    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    termsTextContainer: {
        flex: 1,
    },
    termsText: {
        fontSize: 14,
        flexWrap: 'wrap',
    },
    termsLink: {
        fontWeight: 'bold',
    }
});
