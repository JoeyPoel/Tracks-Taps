import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.userInfo}>
                <Image
                    source={request.requester.avatarUrl ? { uri: request.requester.avatarUrl } : require('../../../assets/images/Mascott.png')}
                    style={styles.avatar}
                />
                <View style={styles.textContainer}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{request.requester.name}</Text>
                    <Text style={[styles.subText, { color: theme.textSecondary }]}>{t('wantsToBeFriend')}</Text>
                </View>
            </View>

            <div style={styles.actions}>
                <TouchableOpacity
                    onPress={() => onAccept(request.id)}
                    style={[styles.iconButton, { backgroundColor: theme.primary }]}
                >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onDecline(request.id)}
                    style={[styles.iconButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.borderPrimary }]}
                >
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </div>
        </View>
    );
}

// Fixed styling (using View instead of div, assuming React Native)
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
    },
    textContainer: {
        gap: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
    },
    subText: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
