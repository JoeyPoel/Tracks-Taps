import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LockClosedIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { authEvents } from '../utils/authEvents';
import { AnimatedButton } from './common/AnimatedButton';
import { AppModal } from './common/AppModal';

export default function AuthRequiredModal() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();
    const segments = useSegments();
    const { theme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        if (segments[0] === 'auth') {
            setVisible(false);
        }
    }, [segments]);

    useEffect(() => {
        const unsubscribe = authEvents.subscribe(() => {
            // Don't show if already on an auth screen
            if (segments[0] !== 'auth') {
                setVisible(true);
            }
        });
        return unsubscribe;
    }, [segments]);

    const handleLogin = () => {
        setVisible(false);
        router.push('/auth/login');
    };

    const handleRegister = () => {
        setVisible(false);
        router.push('/auth/register');
    };

    const handleClose = () => {
        setVisible(false);
    };

    return (
        <AppModal
            visible={visible}
            onClose={handleClose}
            title={t('authRequired')}
            alignment="center"
            icon={
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }]}>
                    <LockClosedIcon size={24} color={theme.primary} />
                </View>
            }
        >
            <TextComponent style={styles.description} color={theme.textSecondary} variant="body">
                {t('authRequiredDesc')}
            </TextComponent>

            <View style={styles.buttonContainer}>
                <AnimatedButton
                    title={t('login') || "Log In"}
                    onPress={handleLogin}
                    variant="primary"
                    style={styles.fullWidthButton}
                />

                <AnimatedButton
                    title={t('createAccount') || "Create Account"}
                    onPress={handleRegister}
                    variant="outline"
                    style={styles.fullWidthButton}
                />
            </View>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        padding: 8,
        borderRadius: 50,
        marginRight: 8,
    },
    description: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 16, // Increased gap for better touch targets
        flexDirection: 'column', // Explicitly vertical
        paddingBottom: 24, // Add padding at bottom
    },
    fullWidthButton: {
        width: '100%',
    },
});
