import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { LockClosedIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';
import { authEvents } from '../utils/authEvents';
import { AnimatedButton } from './common/AnimatedButton';
import { AnimatedPressable } from './common/AnimatedPressable';

export default function AuthRequiredModal() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();
    const segments = useSegments();
    const { theme } = useTheme();

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
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                <View style={[styles.modalView, { backgroundColor: theme.bgPrimary }]}>
                    <AnimatedPressable style={styles.closeButton} onPress={handleClose} interactionScale="subtle" haptic="light">
                        <XMarkIcon size={24} color={theme.textSecondary} />
                    </AnimatedPressable>

                    <View style={styles.iconContainer}>
                        <LockClosedIcon size={48} color={theme.primary} />
                    </View>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                        Authentication Required
                    </Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        You need to be logged in to access this feature. Please sign in or create an account to continue.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <AnimatedButton
                            title="Log In"
                            onPress={handleLogin}
                            variant="primary"
                            style={styles.fullWidthButton}
                        />

                        <AnimatedButton
                            title="Create Account"
                            onPress={handleRegister}
                            variant="outline"
                            style={styles.fullWidthButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalView: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 50,
        backgroundColor: 'rgba(var(--primary-rgb), 0.1)', // Simplification, relies on opacity if rgb var not set, but here icon color handles it.
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    fullWidthButton: {
        width: '100%',
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
