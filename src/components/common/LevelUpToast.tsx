import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserContext } from '@/src/context/UserContext';
import { LevelSystem } from '@/src/utils/levelUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function LevelUpToast() {
    const { user } = useUserContext();
    const { theme } = useTheme();
    const { t } = useLanguage();

    // We need to track the previous level to detect changes
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [visible, setVisible] = useState(false);

    // Animation value for slide/fade
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // Use a ref to store the level to avoid re-triggering on mount if we just want to track *changes*
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (!user) return;

        const newLevel = LevelSystem.getLevel(user.xp);

        if (isFirstRun.current) {
            setCurrentLevel(newLevel);
            isFirstRun.current = false;
            return;
        }

        if (newLevel > currentLevel) {
            setCurrentLevel(newLevel);
            showToast();
        }
    }, [user?.xp]);

    const showToast = () => {
        setVisible(true);
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        setTimeout(() => {
            hideToast();
        }, 4000);
    };

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    };

    if (!visible) return null;

    return (
        <SafeAreaView style={styles.safeArea} pointerEvents="none">
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.primary,
                        transform: [{ translateY }],
                        opacity
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="trophy" size={24} color={theme.fixedWhite || '#FFF'} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.fixedWhite || '#FFF' }]}>{t('levelUp')}</Text>
                    <Text style={[styles.message, { color: theme.fixedWhite || '#FFF' }]}>
                        {t('youReachedLevel').replace('{0}', currentLevel.toString())}
                    </Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999, // Ensure it's on top
        alignItems: 'flex-end', // Right align
        paddingRight: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 10, // Adjust for status bar
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 200,
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    message: {
        fontSize: 14,
    },
});
