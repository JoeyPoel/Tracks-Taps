import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LobbyHeaderProps {
    onInvitePress: () => void;
}

import { useLanguage } from '../../context/LanguageContext';

export const LobbyHeader: React.FC<LobbyHeaderProps> = ({ onInvitePress }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.iconButton, { backgroundColor: theme.bgSecondary }]}
            >
                <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <TextComponent style={styles.headerTitle} color={theme.textPrimary} bold variant="h2">
                {t('lobby')}
            </TextComponent>
            <TouchableOpacity
                onPress={onInvitePress}
                style={[styles.iconButton, { backgroundColor: theme.primary + '15' }]}
            >
                <Ionicons name="person-add" size={20} color={theme.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        marginTop: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
