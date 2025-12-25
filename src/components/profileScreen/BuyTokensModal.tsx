import { useLanguage } from '@/src/context/LanguageContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CircleStackIcon, GiftIcon } from 'react-native-heroicons/outline';
import client from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useUserContext } from '../../context/UserContext';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { AppModal } from '../common/AppModal';

interface BuyTokensModalProps {
    visible: boolean;
    onClose: () => void;
}

const PACKAGES = [
    { tokens: 3, price: 4.99, bonus: 0, popular: false },
    { tokens: 10, price: 14.99, bonus: 2, popular: true },
    { tokens: 25, price: 34.99, bonus: 7, popular: false },
    { tokens: 50, price: 59.99, bonus: 20, popular: false },
];

import { authEvents } from '../../utils/authEvents';

export default function BuyTokensModal({ visible, onClose }: BuyTokensModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user, refreshUser } = useUserContext();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleBuy = async (pkg: typeof PACKAGES[0]) => {
        if (!user) {
            authEvents.emit();
            return;
        }
        if (isLoading) return;

        setIsLoading(true);
        try {
            const totalTokens = pkg.tokens + pkg.bonus;

            await client.post('/user', {
                action: 'buy-tokens',
                userId: user.id,
                amount: totalTokens
            });

            await refreshUser();
            onClose();
        } catch (error) {
            console.error('Error buying tokens:', error);
            // simple alert for now
            alert('Failed to purchase. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={t('buyTokens')}
            icon={<CircleStackIcon size={24} color={theme.accent} />}
            subtitle={t('chooseTokenPackage')}
        >
            <ScrollView contentContainerStyle={styles.packagesContainer}>
                {PACKAGES.map((pkg, index) => {
                    const totalTokens = pkg.tokens + pkg.bonus;
                    const pricePerToken = (pkg.price / totalTokens).toFixed(2);

                    return (
                        <AnimatedPressable
                            key={index}
                            style={[
                                styles.packageCard,
                                { borderColor: pkg.popular ? theme.danger : theme.borderPrimary },
                                pkg.popular && { borderWidth: 2 },
                                isLoading && { opacity: 0.5 }
                            ]}
                            onPress={() => handleBuy(pkg)}
                            disabled={isLoading}
                            interactionScale="medium"
                            haptic="selection"
                        >
                            {pkg.popular && (
                                <View style={[styles.popularBadge, { backgroundColor: theme.danger }]}>
                                    <Text style={[styles.popularText, { color: theme.fixedWhite }]}>{t('mostPopular')}</Text>
                                </View>
                            )}

                            <View style={styles.packageInfo}>
                                <View style={styles.tokenRow}>
                                    <CircleStackIcon size={20} color={theme.accent} />
                                    <Text style={[styles.tokenAmount, { color: theme.textPrimary }]}>
                                        {pkg.tokens} {t('tokens')}
                                    </Text>
                                    {pkg.bonus > 0 && (
                                        <View style={[styles.bonusBadge, { backgroundColor: theme.success }]}>
                                            <Text style={[styles.bonusText, { color: theme.fixedWhite }]}>+{pkg.bonus} {t('bonus')}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.totalTokens, { color: theme.textSecondary }]}>
                                    {t('total')}: {totalTokens} {t('tokensLower')}
                                </Text>
                            </View>

                            <View style={styles.priceInfo}>
                                <Text style={[styles.price, { color: pkg.popular ? theme.danger : theme.textPrimary }]}>
                                    €{pkg.price}
                                </Text>
                                <Text style={[styles.pricePerToken, { color: theme.textSecondary }]}>
                                    €{pricePerToken}/token
                                </Text>
                            </View>
                        </AnimatedPressable>
                    );
                })}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }]}>
                <View style={styles.footerContent}>
                    <GiftIcon size={24} color={theme.primary} />
                    <View style={styles.footerTextContainer}>
                        <Text style={[styles.footerTitle, { color: theme.textPrimary }]}>{t('earnFreeTokens')}</Text>
                        <Text style={[styles.footerDescription, { color: theme.primary }]}>
                            {t('inviteFriendsDescription')}
                        </Text>
                    </View>
                </View>
            </View>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    packagesContainer: {
        paddingBottom: 24,
    },
    packageCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        position: 'relative',
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: [{ translateX: -50 }],
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    packageInfo: {
        flex: 1,
    },
    tokenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    tokenAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bonusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    bonusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    totalTokens: {
        fontSize: 14,
    },
    priceInfo: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    pricePerToken: {
        fontSize: 12,
    },
    footer: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    footerContent: {
        flexDirection: 'row',
        gap: 12,
    },
    footerTextContainer: {
        flex: 1,
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    footerDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
});
