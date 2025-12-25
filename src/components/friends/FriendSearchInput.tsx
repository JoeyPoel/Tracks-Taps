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

    return (
        <View style={[styles.searchContainer, { backgroundColor: theme.bgSecondary }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Add friend by email..."
                placeholderTextColor={theme.textSecondary}
                value={value}
                onChangeText={onChangeText}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onSend}>
                    <Ionicons name="add-circle" size={28} color={theme.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginRight: 8,
    },
});
