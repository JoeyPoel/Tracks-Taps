import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', t('enterEmail'));
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        setLoading(false);

        if (error) {
            Alert.alert(t('failedToReset'), error.message);
        } else {
            Alert.alert('Success', t('checkEmailForReset'));
            router.back();
        }
    };

    return (
        <LinearGradient
            colors={[theme.fixedGradientFrom, theme.fixedGradientTo]}
            style={styles.container}
        >
            <View style={[styles.card, { backgroundColor: theme.bgPrimary }]}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{t('resetPassword')}</Text>

                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {t('enterEmail')}
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{t('email')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.borderInput }]}>
                        <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary }]}
                            placeholder={t('enterEmail')}
                            placeholderTextColor={theme.textTertiary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={handleReset}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.textOnPrimary} />
                    ) : (
                        <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>{t('sendResetLink')}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Link href="/auth/login" asChild>
                        <TouchableOpacity>
                            <Text style={[styles.link, { color: theme.primary }]}>{t('backToLogin')}</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
