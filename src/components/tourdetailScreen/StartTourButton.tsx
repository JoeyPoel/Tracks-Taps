import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface StartTourButtonProps {
    onPress: () => void;
}

export default function StartTourButton({ onPress }: StartTourButtonProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <LinearGradient
                    colors={[theme.fixedGradientFrom, theme.fixedGradientTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                >
                    <Ionicons name="play" size={20} color={theme.fixedWhite} />
                    <Text style={[styles.buttonText, { color: theme.fixedWhite }]}>
                        Start Tour
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
