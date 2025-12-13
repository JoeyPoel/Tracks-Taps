import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', t('enterEmail') + ' & ' + t('enterPassword'));
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);

        if (error) {
            Alert.alert(t('failedToLogin'), error.message);
        }
    };

    return (
        <LinearGradient
            colors={[theme.fixedGradientFrom, theme.fixedGradientTo]}
            style={styles.container}
        >
            <View style={[styles.card, { backgroundColor: theme.bgPrimary }]}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{t('welcomeBack')}</Text>

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
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>
                    <Link href="/auth/forgot-password" asChild>
                        <TouchableOpacity style={styles.forgotContainer}>
                            <Text style={[styles.forgotText, { color: theme.primary }]}>{t('forgotPassword')}</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.textOnPrimary} />
                    ) : (
                        <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>{t('login')}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>{t('noAccount')} </Text>
                    <Link href="/auth/register" asChild>
                        <TouchableOpacity>
                            <Text style={[styles.link, { color: theme.primary }]}>{t('signUp')}</Text>
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
    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
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
    footerText: {
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
