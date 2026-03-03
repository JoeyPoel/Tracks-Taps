import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TicketIcon } from 'react-native-heroicons/solid';

interface TourInviteCardProps {
    invite: any;
    processingId: number | null;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}

export function TourInviteCard({ invite, processingId, onAccept, onDecline }: TourInviteCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.inviteCard, { backgroundColor: theme.bgSecondary }]}>
            <View style={[styles.inviteIcon, { backgroundColor: theme.primary + '20' }]}>
                <TicketIcon size={24} color={theme.primary} />
            </View>

            <View style={styles.inviteInfo}>
                <TextComponent style={styles.inviteTourName} color={theme.textPrimary} bold variant="body" numberOfLines={1}>
                    {invite.parsedData?.tourName || "Unknown Tour"}
                </TextComponent>
                <TextComponent style={styles.inviteFrom} color={theme.textSecondary} variant="caption" numberOfLines={1}>
                    {t('invitedBy') || "Invited by"} {invite.parsedData?.inviterName || "a friend"}
                </TextComponent>
            </View>

            <View style={styles.inviteActions}>
                {processingId === invite.id ? (
                    <ActivityIndicator color={theme.primary} />
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => onDecline(invite.id)}
                            style={[styles.actionButton, { backgroundColor: theme.bgTertiary, marginRight: 8 }]}
                        >
                            <Ionicons name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => onAccept(invite.id)}
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        >
                            <Ionicons name="checkmark" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inviteCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inviteIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    inviteInfo: {
        flex: 1,
        marginRight: 12,
    },
    inviteTourName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    inviteFrom: {
        fontSize: 13,
        fontWeight: '500',
    },
    inviteActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
