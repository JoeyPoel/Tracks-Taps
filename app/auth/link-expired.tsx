import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LinkExpiredScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { error_description } = useLocalSearchParams();

    // Safety check: handle array or string
    const errorMessage = Array.isArray(error_description)
        ? error_description[0]
        : error_description;

    const [email, setEmail] = React.useState('');
    const [isResending, setIsResending] = React.useState(false);
    const [resendSuccess, setResendSuccess] = React.useState(false);

    const handleResend = async () => {
        if (!email) return;
        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: typeof window !== 'undefined'
                        ? `${window.location.origin}/auth/confirm-email`
                        : undefined
                }
            });
            if (error) throw error;
            setResendSuccess(true);
        } catch (e: any) {
            console.error(e);
            alert(e.message || t('failedToResendEmail'));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <View style={styles.content}>

                {/* Icon Section */}
                <Animated.View
                    entering={FadeInUp.delay(200).springify()}
                    style={styles.iconContainer}
                >
                    <Ionicons name="alert-circle-outline" size={80} color={theme.error || '#FF0000'} />
                    <View style={[styles.glow, { backgroundColor: theme.error || '#FF0000' }]} />
                </Animated.View>

                {/* Text Section */}
                <Animated.Text
                    entering={FadeInDown.delay(400).springify()}
                    style={[styles.title, { color: theme.textPrimary }]}
                >
                    {t('linkExpired') || "Link Expired"}
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.delay(600).springify()}
                    style={[styles.subtitle, { color: theme.textSecondary }]}
                >
                    {errorMessage || t('emailLinkExpiredDesc') || "The link you clicked is invalid or has expired. Please enter your email to receive a new one."}
                </Animated.Text>

                {!resendSuccess && (
                    <Animated.View entering={FadeInDown.delay(700).springify()} style={{ width: '100%', marginBottom: 20 }}>
                        <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>{t('enterEmailToResend')}</Text>
                        <TextInput
                            style={{
                                backgroundColor: theme.bgSecondary,
                                color: theme.textPrimary,
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: theme.borderPrimary || '#ccc'
                            }}
                            placeholder="email@example.com"
                            placeholderTextColor={theme.textTertiary || '#888'}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TouchableOpacity
                            onPress={handleResend}
                            disabled={isResending || !email}
                            style={[styles.button, { backgroundColor: theme.primary, opacity: (isResending || !email) ? 0.7 : 1, marginBottom: 0 }]}
                        >
                            {isResending ? (
                                <ActivityIndicator color={theme.textOnPrimary} />
                            ) : (
                                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>{t('resendConfirmation')}</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {resendSuccess && (
                    <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 20, padding: 16, backgroundColor: (theme.success || '#00ff00') + '20', borderRadius: 12 }}>
                        <Text style={{ color: theme.success, textAlign: 'center', fontWeight: 'bold' }}>{t('newEmailSent')}</Text>
                    </Animated.View>
                )}

                {/* Button Section */}
                <Animated.View
                    entering={FadeInDown.delay(800).springify()}
                    style={styles.buttonContainer}
                >
                    <Link href="/auth/login" asChild>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.bgSecondary }]}
                        >
                            <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
                                {t('backToLogin') || "Back to Login"}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.15,
        zIndex: -1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
});
