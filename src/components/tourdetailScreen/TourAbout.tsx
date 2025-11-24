import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TourAboutProps {
    description: string;
}

export default function TourAbout({ description }: TourAboutProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>About this tour</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                {description}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
    },
});
