import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function MapScreen() {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <Text style={[styles.text, { color: theme.textPrimary }]}>
                Google Maps on Web requires additional configuration (API Key).
            </Text>
            <Text style={[styles.subText, { color: theme.textSecondary }]}>
                Please view on iOS/Android to see the native map.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
