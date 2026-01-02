import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface PostTourHeaderProps {
    imageUrl?: string;
}

export default function PostTourHeader({ imageUrl }: PostTourHeaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            {imageUrl ? (
                <ImageBackground
                    source={{ uri: imageUrl }}
                    style={styles.imageBackground}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['transparent', theme.bgPrimary]}
                        style={styles.gradientOverlay}
                        start={{ x: 0.5, y: 0.3 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                </ImageBackground>
            ) : (
                <LinearGradient
                    colors={[theme.secondary, theme.primary]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            )}

            <View style={styles.content}>
                <TextComponent style={styles.headerTitle} color={theme.textPrimary} bold>
                    {t('greatJobTitle')}
                </TextComponent>
                <TextComponent style={styles.headerSubtitle} color={theme.textSecondary}>
                    {t('waitingForTeams')}
                </TextComponent>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageBackground: {
        width: '100%',
        height: 300,
        justifyContent: 'flex-end',
    },
    headerGradient: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
    },
    content: {
        alignItems: 'center',
        marginTop: -60, // Pull text up into the fade area
        zIndex: 2,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});
