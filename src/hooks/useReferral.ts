import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { referralService } from '../services/referralService';

export const useReferral = () => {
    const { user, refreshUser } = useUserContext();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyReferralCode = async () => {
        if (user?.referralCode) {
            await Clipboard.setStringAsync(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const claimReferral = async (code: string) => {
        if (!code.trim() || !user?.id) return;

        setLoading(true);
        setError('');

        try {
            const response = await referralService.claimReferral(user.id, code);

            if (response.error) {
                setError(response.error);
                return false;
            } else {
                setSuccess(true);
                await refreshUser();
                return true;
            }
        } catch (err: any) {
            console.error('Claim error:', err);
            setError(err.response?.data?.error || t('referralError'));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError('');

    const resetReferralState = () => {
        setSuccess(false);
        setError('');
        setLoading(false);
    };

    return {
        claimReferral,
        copyReferralCode,
        resetReferralState,
        clearError,
        loading,
        error,
        success,
        copied,
        userReferralCode: user?.referralCode
    };
};
