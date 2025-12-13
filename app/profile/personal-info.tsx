import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalInfoScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const { signOut, user } = useAuth();

    const handleAction = async () => {
        if (user) {
            await signOut();
            router.replace('/(tabs)/profile');
        } else {
            router.push('/auth/login');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                    {user ? t('personalInfo') : t('loginRequired')}
                </Text>

                <View style={styles.card}>
                    {user ? (
                        <>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('email')}</Text>
                            <Text style={[styles.value, { color: theme.textPrimary }]}>{user.email}</Text>
                        </>
                    ) : (
                        <Text style={[styles.message, { color: theme.textSecondary }]}>
                            {t('loginToViewProfile', 'Please login to manage your personal details.')}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: user ? theme.danger : theme.primary }
                    ]}
                    onPress={handleAction}
                >
                    <Text style={styles.buttonText}>
                        {user ? t('logout') : t('login')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    card: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
