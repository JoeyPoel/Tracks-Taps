import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SocialButtonProps {
    text: string;
    onPress: () => void;
    icon?: 'google' | 'apple' | 'facebook'; // add more as needed
    loading?: boolean;
}

export default function SocialButton({ text, onPress, icon, loading }: SocialButtonProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}
            onPress={onPress}
            disabled={loading}
        >
            <View style={styles.content}>
                {icon === 'google' && (
                    <Ionicons name="logo-google" size={20} color={theme.textPrimary} style={styles.icon} />
                )}
                {/* Fallback or other icons */}

                <Text style={[styles.text, { color: theme.textPrimary }]}>{text}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 16,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
