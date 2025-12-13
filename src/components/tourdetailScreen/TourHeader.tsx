import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TourHeaderProps {
    title: string;
    author: string;
    imageUrl: string;
}

export default function TourHeader({ title, author, imageUrl }: TourHeaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const router = useRouter();

    return (
        <ImageBackground source={{ uri: imageUrl }} style={styles.background}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Pressable
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.fixedWhite} />
                </Pressable>
            </SafeAreaView>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.fixedWhite }]}>{title}</Text>
                    <Text style={[styles.author, { color: theme.fixedWhite }]}>
                        {t('createdBy')} {author}
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
        padding: 24,
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
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        marginLeft: 24,
        marginTop: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
});
