import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TourHeaderProps {
    title: string;
    author: string;
    imageUrl: string;
}

export default function TourHeader({ title, author, imageUrl }: TourHeaderProps) {
    const { theme } = useTheme();

    return (
        <ImageBackground source={{ uri: imageUrl }} style={styles.background}>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.fixedWhite }]}>{title}</Text>
                    <Text style={[styles.author, { color: theme.fixedWhite }]}>
                        Created by {author}
                    </Text>
                </View>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        padding: 16,
    },
    content: {
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    author: {
        fontSize: 16,
        opacity: 0.9,
    },
});
