import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CheckIcon, CircleStackIcon, ClipboardDocumentIcon, GiftIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useUserContext } from '../../context/UserContext';
import { authEvents } from '../../utils/authEvents';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { AppModal } from '../common/AppModal';

interface BuyTokensModalProps {
    visible: boolean;
    onClose: () => void;
}

const PACKAGES = [
    { tokens: 1, price: 2.49, bonus: 0, popular: false },
    { tokens: 2, price: 5.49, bonus: 0, popular: false },
    { tokens: 5, price: 12.49, bonus: 0, popular: true },
    { tokens: 10, price: 19.99, bonus: 0, popular: false },
];


// ... imports
import { PurchasesPackage } from 'react-native-purchases';
import { usePurchases } from '../../hooks/usePurchases';

// ... inside component

export default function BuyTokensModal({ visible, onClose }: BuyTokensModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user, refreshUser } = useUserContext();
    const { purchasePackage, packages } = usePurchases(); // Use hook directly
    const [isLoading, setIsLoading] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    // Map local definitions to RevenueCat packages
    // We assume package identifiers contain '1_token', '2_tokens', etc. or match by price/metadata
    // For simplicity, we'll try to find a package where identifier contains explicitly the token amount
    // or fall back to manual mapping if we knew the exact IDs.
    // Let's assume the IDs are: 'tokens_1', 'tokens_2', 'tokens_5', 'tokens_10'

    const getRcPackage = (tokens: number): PurchasesPackage | undefined => {
        return packages.find(p => p.identifier.includes(`tokens_${tokens}`) || p.product.identifier.includes(`tokens_${tokens}`));
    };

    const displayPackages = PACKAGES.map(pkg => {
        const rcPkg = getRcPackage(pkg.tokens);
        return {
            ...pkg,
            rcPackage: rcPkg,
            priceString: rcPkg?.product.priceString || `€${pkg.price.toFixed(2)}`,
            // If RC package exists, use its price, otherwise fallback
        };
    });

    const handleCopy = async () => {
        if (user?.referralCode) {
            await Clipboard.setStringAsync(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleBuy = async (pkg: typeof PACKAGES[0] & { rcPackage?: PurchasesPackage }) => {
        if (!user) {
            authEvents.emit();
            return;
        }
        if (isLoading) return;

        setIsLoading(true);
        try {

            if (pkg.rcPackage) {
                // Purchase via RevenueCat
                const success = await purchasePackage(pkg.rcPackage);

                if (success) {
                    await refreshUser();
                    onClose();
                }
            } else {
                alert('Configuration Error: Package not found in Store.');
            }
        } catch (error) {
            console.error('Error buying tokens:', error);
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
                {displayPackages.map((pkg, index) => {
                    const totalTokens = pkg.tokens + pkg.bonus;
                    const pricePerToken = (pkg.price / totalTokens).toFixed(2); // Keep logic for now, or calculate from RC price

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
                                    <TextComponent style={styles.popularText} color={theme.fixedWhite} bold variant="caption">{t('mostPopular')}</TextComponent>
                                </View>
                            )}

                            <View style={styles.packageInfo}>
                                <View style={styles.tokenRow}>
                                    <CircleStackIcon size={20} color={theme.accent} />
                                    <TextComponent style={styles.tokenAmount} color={theme.textPrimary} bold variant="h3">
                                        {pkg.tokens} {t('tokens')}
                                    </TextComponent>
                                    {pkg.bonus > 0 && (
                                        <View style={[styles.bonusBadge, { backgroundColor: theme.success }]}>
                                            <TextComponent style={styles.bonusText} color={theme.fixedWhite} bold variant="caption">+{pkg.bonus} {t('bonus')}</TextComponent>
                                        </View>
                                    )}
                                </View>
                                <TextComponent style={styles.totalTokens} color={theme.textSecondary} variant="caption">
                                    {t('total')}: {totalTokens} {t('tokensLower')}
                                </TextComponent>
                            </View>

                            <View style={styles.priceInfo}>
                                <TextComponent style={styles.price} color={pkg.popular ? theme.danger : theme.textPrimary} bold variant="h3">
                                    {pkg.priceString}
                                </TextComponent>
                                {/* <TextComponent style={styles.pricePerToken} color={theme.textSecondary} variant="caption">
                                        €{pricePerToken}/token
                                    </TextComponent> */}
                            </View>
                        </AnimatedPressable>
                    );
                })}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }]}>
                <View style={styles.footerContent}>
                    <GiftIcon size={24} color={theme.primary} />
                    <View style={styles.footerTextContainer}>
                        <TextComponent style={styles.footerTitle} color={theme.textPrimary} bold variant="body">{t('earnFreeTokens')}</TextComponent>
                        <TextComponent style={styles.footerDescription} color={theme.primary} variant="caption">
                            {t('inviteFriendsDescription')}
                        </TextComponent>

                        {user?.referralCode && (
                            <AnimatedPressable
                                style={[styles.codeContainer, { backgroundColor: theme.bgTertiary }]}
                                onPress={handleCopy}
                            >
                                <TextComponent style={styles.codeLabel} color={theme.textSecondary} variant="caption">{t('yourCode')}:</TextComponent>
                                <View style={styles.codeWrapper}>
                                    <TextComponent style={styles.codeText} color={theme.textPrimary} bold variant="body">
                                        {user.referralCode?.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') || user.referralCode}
                                    </TextComponent>
                                    {copied ? <CheckIcon size={18} color={theme.success} /> : <ClipboardDocumentIcon size={18} color={theme.textSecondary} />}
                                </View>
                            </AnimatedPressable>
                        )}
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
    codeContainer: {
        marginTop: 12,
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    codeLabel: {
        marginRight: 4,
    },
    codeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    codeText: {
        letterSpacing: 1,
    }
});
