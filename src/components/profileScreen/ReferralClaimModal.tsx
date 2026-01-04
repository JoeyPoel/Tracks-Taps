import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { GiftIcon, TicketIcon } from 'react-native-heroicons/outline';
import client from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useUserContext } from '../../context/UserContext';
import { AnimatedButton } from '../common/AnimatedButton';
import { AppModal } from '../common/AppModal';

interface ReferralClaimModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ReferralClaimModal({ visible, onClose }: ReferralClaimModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user, refreshUser } = useUserContext();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClaim = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setError('');

        try {
            const response = await client.post('/user', {
                action: 'claim-referral',
                userId: user?.id,
                code: code.trim().toUpperCase() // Normalize
            });

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setSuccess(true);
                await refreshUser();
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setCode('');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Claim error:', err);
            setError(err.response?.data?.error || t('referralError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={t('claimReferral')}
            icon={<TicketIcon size={24} color={theme.accent} />}
            subtitle={t('enterReferralCode')}
        >
            <View style={styles.container}>
                {success ? (
                    <View style={styles.successContainer}>
                        <GiftIcon size={48} color={theme.success} />
                        <TextComponent style={styles.successText} color={theme.success} bold variant="h3">
                            {t('referralClaimed')}
                        </TextComponent>
                    </View>
                ) : (
                    <>
                        <View style={[styles.inputContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                placeholder={t('referralCodePlaceholder')}
                                placeholderTextColor={theme.textSecondary}
                                value={code}
                                onChangeText={(text) => {
                                    setCode(text);
                                    setError('');
                                }}
                                keyboardType="number-pad"
                            />
                        </View>

                        {error ? (
                            <TextComponent style={styles.errorText} color={theme.danger} variant="caption">
                                {error}
                            </TextComponent>
                        ) : null}

                        <AnimatedButton
                            title={t('claim')}
                            onPress={handleClaim}
                            loading={loading}
                            disabled={!code.trim() || loading}
                            variant="primary"
                            style={styles.button}
                        />
                    </>
                )}
            </View>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    inputContainer: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    input: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 2,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        width: '100%',
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 16,
    },
    successText: {
        textAlign: 'center',
    }
});
