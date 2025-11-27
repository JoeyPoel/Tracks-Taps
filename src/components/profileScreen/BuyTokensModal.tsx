import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.bgPrimary }]}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons name="disc" size={24} color="#FFC107" />
                            <Text style={[styles.title, { color: theme.textPrimary }]}>Buy Tokens</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Choose a token package to continue playing tours
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
                                            <Text style={styles.popularText}>Most Popular</Text>
                                        </View>
                                    )}

                                    <View style={styles.packageInfo}>
                                        <View style={styles.tokenRow}>
                                            <Ionicons name="disc-outline" size={20} color="#FFC107" />
                                            <Text style={[styles.tokenAmount, { color: theme.textPrimary }]}>
                                                {pkg.tokens} Tokens
                                            </Text>
                                            {pkg.bonus > 0 && (
                                                <View style={[styles.bonusBadge, { backgroundColor: theme.success }]}>
                                                    <Text style={styles.bonusText}>+{pkg.bonus} Bonus</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.totalTokens, { color: theme.textSecondary }]}>
                                            Total: {totalTokens} tokens
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
                                <Text style={[styles.footerTitle, { color: theme.textPrimary }]}>Earn Free Tokens!</Text>
                                <Text style={[styles.footerDescription, { color: theme.primary }]}>
                                    Invite friends and earn 3 tokens for each friend who joins. Tap "Invite Friends" to get your referral link!
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        color: '#FFFFFF',
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
        color: '#FFFFFF',
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
