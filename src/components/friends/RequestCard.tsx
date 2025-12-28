import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RequestCardProps {
    request: any;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}

export function RequestCard({ request, onAccept, onDecline }: RequestCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.cardContent}>
                <Image source={request.requester.avatarUrl ? { uri: request.requester.avatarUrl } : require('../../../assets/images/Mascott.png')} style={styles.avatar} />
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{request.requester.name}</Text>
                    <Text style={[styles.subText, { color: theme.textSecondary }]}>{t('wantsToBeFriend')}</Text>
                </View>
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity
                    onPress={() => onAccept(request.id)}
                    style={{ flex: 1 }}
                    activeOpacity={0.8}
                >
                    <View
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    >
                        <Text style={styles.actionButtonText}>{t('accept')}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onDecline(request.id)}
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: 'transparent',
                            marginLeft: 8,
                            flex: 1,
                            borderWidth: 1,
                            borderColor: theme.secondary
                        }
                    ]}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>{t('decline')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    subText: {
        fontSize: 14,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#00000010',
    },
    actionButton: {
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
});
