import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { CheckIcon, ClipboardDocumentIcon, GiftIcon, TicketIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useReferral } from '../../hooks/useReferral';
import { AnimatedButton } from '../common/AnimatedButton';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { AppModal } from '../common/AppModal';

interface ReferralClaimModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ReferralClaimModal({ visible, onClose }: ReferralClaimModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const [code, setCode] = useState('');

    const {
        claimReferral,
        copyReferralCode,
        resetReferralState,
        clearError,
        loading,
        error,
        success,
        copied,
        userReferralCode
    } = useReferral();

    const handleClaim = async () => {
        const isSuccess = await claimReferral(code);
        if (isSuccess) {
            setTimeout(() => {
                onClose();
                resetReferralState();
                setCode('');
            }, 1500);
        }
    };

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={t('claimReferral')}
            icon={<TicketIcon size={24} color={theme.accent} />}
            subtitle={t('enterReferralCode')}
            height="60%"
        >
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
                                    clearError();
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

                        {userReferralCode && (
                            <View style={[styles.dividerContainer, { borderTopColor: theme.borderPrimary }]}>
                                <TextComponent style={styles.dividerText} color={theme.textSecondary} variant="caption">
                                    {t('orShareYourCode')}
                                </TextComponent>
                                <AnimatedPressable
                                    style={[styles.shareContainer, { backgroundColor: theme.bgTertiary }]}
                                    onPress={copyReferralCode}
                                >
                                    <View>
                                        <TextComponent style={styles.shareLabel} color={theme.textSecondary} variant="caption">{t('yourCode')}</TextComponent>
                                        <TextComponent style={styles.shareCode} color={theme.textPrimary} bold variant="h3">
                                            {userReferralCode.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
                                        </TextComponent>
                                    </View>
                                    <View style={[styles.copyButton, { backgroundColor: theme.bgSecondary }]}>
                                        {copied ? <CheckIcon size={20} color={theme.success} /> : <ClipboardDocumentIcon size={20} color={theme.primary} />}
                                    </View>
                                </AnimatedPressable>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </AppModal >
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
        gap: 20, // Add gap for general spacing
        flexGrow: 1,
    },
    inputContainer: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    input: {
        fontSize: 22, // Larger font
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 3,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        width: '100%',
        marginTop: 8,
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 16,
        flex: 1, // utilize space
    },
    successText: {
        textAlign: 'center',
    },
    dividerContainer: {
        marginTop: 'auto', // Push to bottom
        paddingTop: 32,
        borderTopWidth: 1,
        alignItems: 'center',
        width: '100%',
        gap: 16,
    },
    dividerText: {
        marginBottom: 4,
    },
    shareContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 16, // More padding
        borderRadius: 16,
    },
    shareLabel: {
        marginBottom: 2,
        fontSize: 12,
    },
    shareCode: {
        letterSpacing: 1,
    },
    copyButton: {
        padding: 10,
        borderRadius: 8,
    }
});
