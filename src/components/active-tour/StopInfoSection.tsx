import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface StopInfoSectionProps {
    stop: any; // Using any to avoid strict type issues if models aren't updated yet in frontend types
}

export default function StopInfoSection({ stop }: StopInfoSectionProps) {
    const { theme } = useTheme();

    if (!stop) return null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {stop.imageUrl ? (
                <Image
                    source={{ uri: stop.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : null}

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{stop.name}</Text>

                <Text style={[styles.description, { color: theme.textSecondary }]}>
                    {stop.detailedDescription || stop.description || "No detailed information available for this stop."}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 16,
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
});
