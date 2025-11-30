import { useLanguage } from '@/src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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

export default function BuyTokensModal({ visible, onClose }: BuyTokensModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90,
            }).start();
        } else {
            slideAnim.setValue(Dimensions.get('window').height);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: theme.bgPrimary,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons name="disc" size={24} color={theme.accent} />
                            <Text style={[styles.title, { color: theme.textPrimary }]}>{t('buyTokens')}</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {t('chooseTokenPackage')}
                    </Text>

                    <ScrollView contentContainerStyle={styles.packagesContainer}>
                        {PACKAGES.map((pkg, index) => {
                            const totalTokens = pkg.tokens + pkg.bonus;
                            const pricePerToken = (pkg.price / totalTokens).toFixed(2);

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.packageCard,
                                        { borderColor: pkg.popular ? theme.danger : theme.borderPrimary },
                                        pkg.popular && { borderWidth: 2 }
                                    ]}
                                >
                                    {pkg.popular && (
                                        <View style={[styles.popularBadge, { backgroundColor: theme.danger }]}>
                                            <Text style={[styles.popularText, { color: theme.fixedWhite }]}>{t('mostPopular')}</Text>
                                        </View>
                                    )}

                                    <View style={styles.packageInfo}>
                                        <View style={styles.tokenRow}>
                                            <Ionicons name="disc-outline" size={20} color={theme.accent} />
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
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={[styles.footer, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }]}>
                        <View style={styles.footerContent}>
                            <Ionicons name="gift-outline" size={24} color={theme.primary} />
                            <View style={styles.footerTextContainer}>
                                <Text style={[styles.footerTitle, { color: theme.textPrimary }]}>{t('earnFreeTokens')}</Text>
                                <Text style={[styles.footerDescription, { color: theme.primary }]}>
                                    {t('inviteFriendsDescription')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
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
