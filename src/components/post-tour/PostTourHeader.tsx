import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PostTourHeader() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.secondary, theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.content}>
                    <Text style={[styles.headerTitle, { color: theme.fixedWhite }]}>
                        {t('greatJobTitle')}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
                        {t('waitingForTeams')}
                    </Text>
                </View>

                {/* Decorative circles */}
                <View style={[styles.circle, { top: -20, left: -20, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <View style={[styles.circle, { bottom: -40, right: -10, width: 140, height: 140, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 200,
        marginBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    headerGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40, // Space for status bar/header
    },
    content: {
        alignItems: 'center',
        zIndex: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        textAlign: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 100,
    }
});
