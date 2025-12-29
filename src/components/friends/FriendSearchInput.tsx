import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface FriendSearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
}

export function FriendSearchInput({ value, onChangeText, onSend }: FriendSearchInputProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <Ionicons name="search" size={18} color={theme.textTertiary} />
            <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder={t('addFriendPlaceholder')}
                placeholderTextColor={theme.textTertiary}
                value={value}
                onChangeText={onChangeText}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onSend} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-forward-circle" size={24} color={theme.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
});
