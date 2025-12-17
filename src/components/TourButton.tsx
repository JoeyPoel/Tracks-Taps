import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StartTourButtonProps {
    onPress: () => void;
    buttonText: string;
    disabled?: boolean;
    style?: any;
}

export default function StartTourButton({ onPress, buttonText, disabled, style }: StartTourButtonProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled}>
                <LinearGradient
                    colors={[theme.fixedGradientFrom, theme.fixedGradientTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.button, { opacity: disabled ? 0.7 : 1 }]}
                >
                    <Ionicons name="play" size={20} color={theme.fixedWhite} />
                    <Text style={[styles.buttonText, { color: theme.fixedWhite }]}>
                        {buttonText}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // padding removed to let parent control layout
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
