import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TokenCardProps {
    tokens: number;
    onBuyPress: () => void;
    onInvitePress: () => void;
}

export default function TokenCard({ tokens, onBuyPress, onInvitePress }: TokenCardProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFC107', '#FF375D']} // Orange to Pink gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="disc-outline" size={32} color="#FFFFFF" />
                        <Ionicons name="disc" size={24} color="#FFFFFF" style={styles.iconOverlay} />
                    </View>
                    <View style={styles.balanceContainer}>
                        <Text style={styles.label}>Your Tokens</Text>
                        <Text style={styles.balance}>{tokens}</Text>
                    </View>
                    <Ionicons name="sparkles" size={32} color="rgba(255,255,255,0.5)" style={styles.sparkleIcon} />
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.button} onPress={onBuyPress}>
                        <Ionicons name="cart-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Buy Tokens</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={onInvitePress}>
                        <Ionicons name="person-add-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Invite Friends</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconOverlay: {
        position: 'absolute',
        top: 14,
        left: 14,
    },
    balanceContainer: {
        flex: 1,
    },
    label: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        marginBottom: 4,
    },
    balance: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    sparkleIcon: {
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
