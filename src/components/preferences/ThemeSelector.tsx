import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppModal } from '../common/AppModal';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { TextComponent } from '../common/TextComponent';
import { COLOR_THEMES } from '../../constants/themes';
import { darkTheme, lightTheme } from '../../context/theme';

interface ThemeSelectorProps {
    user: any;
    mode: 'light' | 'dark';
    theme: any;
    onSelectTheme: (themeId: string | null, event?: any) => void;
    t: (key: any) => string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    user,
    mode,
    theme,
    onSelectTheme,
    t
}) => {
    if (!user) {
        return (
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, padding: 20, alignItems: 'center' }]}>
                <Ionicons name="brush-outline" size={32} color={theme.textTertiary} style={{ marginBottom: 10 }} />
                <TextComponent style={{ textAlign: 'center', marginBottom: 6 }} color={theme.textPrimary} bold variant="body">
                    Personalize Your Experience
                </TextComponent>
                <TextComponent style={{ textAlign: 'center', marginBottom: 16 }} color={theme.textSecondary} variant="caption">
                    Sign in to unlock 10 premium custom color themes and save your preferences.
                </TextComponent>
            </View>
        );
    }

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
                <TextComponent color={theme.textSecondary} variant="caption">
                    Select a custom color palette to skin the app.
                </TextComponent>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.themeScrollContainer}
            >
                {/* Default Theme Card */}
                {(() => {
                    const isActive = !user.customTheme;
                    const colors: [string, string] = mode === 'dark'
                        ? ['#1E293B', '#0F172A']
                        : ['#FFFFFF', '#F8FAFC'];

                    return (
                        <AnimatedPressable
                            onPress={(e) => onSelectTheme(null, e)}
                            style={[
                                styles.themeOption,
                                {
                                    backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                                    borderWidth: isActive ? 1.5 : 1
                                }
                            ]}
                        >
                            <LinearGradient
                                colors={colors}
                                style={styles.themeColorCircle}
                            />
                            <TextComponent
                                style={styles.themeLabel}
                                color={isActive ? theme.primary : theme.textPrimary}
                                bold={isActive}
                                variant="caption"
                                numberOfLines={1}
                            >
                                Default
                            </TextComponent>
                            {isActive && (
                                <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                    <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                                </View>
                            )}
                        </AnimatedPressable>
                    );
                })()}

                {/* COLOR_THEMES */}
                {COLOR_THEMES.filter(tc => !tc.id.endsWith('_accessibility')).map((themeConfig) => {
                    const isActive = user.customTheme === themeConfig.id;
                    const config = mode === 'dark' ? themeConfig.dark : themeConfig.light;
                    const colors: [string, string] = [
                        config.primary || theme.primary,
                        config.secondary || config.primary || theme.secondary
                    ];

                    return (
                        <AnimatedPressable
                            key={themeConfig.id}
                            onPress={(e) => onSelectTheme(themeConfig.id, e)}
                            style={[
                                styles.themeOption,
                                {
                                    backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                                    borderWidth: isActive ? 1.5 : 1
                                }
                            ]}
                        >
                            <LinearGradient
                                colors={colors}
                                style={styles.themeColorCircle}
                            />
                            <TextComponent
                                style={styles.themeLabel}
                                color={isActive ? theme.primary : theme.textPrimary}
                                bold={isActive}
                                variant="caption"
                                numberOfLines={1}
                            >
                                {themeConfig.name}
                            </TextComponent>
                            {isActive && (
                                <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                    <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                                </View>
                            )}
                        </AnimatedPressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    themeScrollContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    themeOption: {
        width: 100,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        position: 'relative',
    },
    themeColorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    themeLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    activeBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
