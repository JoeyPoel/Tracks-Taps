import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectableFriendCardProps {
    friend: any;
    isSelected: boolean;
    onToggle: (id: number) => void;
}

export function SelectableFriendCard({ friend, isSelected, onToggle }: SelectableFriendCardProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.itemCard,
                { backgroundColor: theme.bgSecondary },
                isSelected && styles.selectedItemCard
            ]}
            onPress={() => onToggle(friend.id)}
        >
            {isSelected && (
                <LinearGradient
                    colors={[theme.primary + '20', theme.secondary + '10']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            )}
            <Image source={friend.avatarUrl ? { uri: friend.avatarUrl } : require('../../../assets/images/Mascott.png')} style={styles.avatar} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.textPrimary }]}>{friend.name}</Text>
                <Text style={[styles.subText, { color: theme.textSecondary }]}>Lvl {friend.level}</Text>
            </View>
            <View style={[
                styles.checkbox,
                { borderColor: isSelected ? theme.primary : theme.textSecondary },
                isSelected && { backgroundColor: theme.primary }
            ]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedItemCard: {
        // Additional styling if needed
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 18,
        marginRight: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    subText: {
        fontSize: 13,
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
});
