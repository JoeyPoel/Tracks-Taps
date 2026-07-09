import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkTheme, lightTheme, romanticLightTheme, romanticDarkTheme } from './theme';
import * as SystemUI from 'expo-system-ui';
import { useStore } from '../store/store';
import { userService } from '../services/userService';
import client from '../api/apiClient';
import { HOLIDAY_THEMES, COLOR_THEMES, getOverriddenTheme } from '../constants/themes';

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
    mode: ThemeMode;
    theme: typeof lightTheme;
    toggleTheme: () => void;
    triggerOverlay: (type: string | null) => void;
    overlayTrigger: number;
    overlayType: string | null;
    refreshThemeSettings: () => Promise<void>;
    activeHoliday: { id: string; name: string; description: string } | null;
}

const themes = {
    light: lightTheme,
    dark: darkTheme,
    romanticLight: romanticLightTheme,
    romanticDark: romanticDarkTheme,
}

const THEME_STORAGE_KEY = '@app_theme_mode';

const ThemeContext = createContext<ThemeContextProps>({
    mode: "light",
    theme: lightTheme,
    toggleTheme: (): void => { },
    triggerOverlay: (): void => { },
    overlayTrigger: 0,
    overlayType: null,
    refreshThemeSettings: async (): Promise<void> => { },
    activeHoliday: null
});

export const ThemeProvider = ({ children }: { children: ReactNode }): ReactNode => {
    const systemScheme: ColorSchemeName = useColorScheme();
    const user = useStore(state => state.user);
    const updateUser = useStore(state => state.updateUser);
    
    // Global theme overrides state
    const [globalThemeOverride, setGlobalThemeOverride] = useState<string | null>(null);
    const [autoThemeEnabled, setAutoThemeEnabled] = useState(true);

    // Default to stored user preference immediately if available to prevent flash
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (user?.themePreference && user.themePreference !== 'system') {
            return user.themePreference as ThemeMode;
        }
        return systemScheme === "light" ? "light" : "dark";
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [overlayTrigger, setOverlayTrigger] = useState(0);
    const [overlayType, setOverlayType] = useState<string | null>(null);

    const refreshThemeSettings = React.useCallback(async () => {
        try {
            const res = await client.get('/app-settings');
            if (res.data) {
                setGlobalThemeOverride(res.data.globalThemeOverride || null);
                setAutoThemeEnabled(res.data.autoThemeEnabled !== false);
            }
        } catch (e) {
            console.warn('Failed to load global app theme settings', e);
        }
    }, []);

    useEffect((): void => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme === 'dark' || storedTheme === 'light') {
                    setMode(storedTheme);
                } else if (systemScheme) {
                    setMode(systemScheme);
                }
            } catch (e) {
                console.warn('Failed to load theme from storage', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
        refreshThemeSettings();
    }, [systemScheme, refreshThemeSettings]);



    const userId = user?.id;

    // Sync with remote user profile
    useEffect(() => {
        if (isLoaded && user?.themePreference && user.themePreference !== 'system') {
            const remoteMode = user.themePreference as ThemeMode;
            if (remoteMode !== mode) {
                setMode(remoteMode);
            }
        }
    }, [user?.themePreference, isLoaded]);

    const toggleTheme = React.useCallback((): void => {
        setMode(prev => {
            const next = prev === "light" ? "dark" : "light";
            // Persist to remote and update store
            if (userId) {
                updateUser(userId, { themePreference: next }).catch(() => {});
            }
            return next;
        });
    }, [userId, updateUser]);

    // Persist theme changes
    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(e => 
                console.error('Failed to save theme', e)
            );
        }
    }, [mode, isLoaded]);

    const triggerOverlay = React.useCallback((type: string | null) => {
        setOverlayType(type);
        if (type) {
            setOverlayTrigger(prev => prev + 1);
        } else {
            setOverlayTrigger(0);
        }
    }, []);

    // Determine current theme based on mode, custom user theme, and global overrides/holidays
    const theme = React.useMemo(() => {
        // 1. Romantic overlay trigger (legacy easter egg / secret theme) has highest priority
        if (overlayType === 'romantic') {
            const romanticKey = `romantic${mode.charAt(0).toUpperCase() + mode.slice(1)}` as keyof typeof themes;
            return themes[romanticKey] || themes[mode];
        }

        // 2. Holiday Global Override or Auto Theme has second priority
        let activeOverrideThemeId: string | null = globalThemeOverride || null;

        if (!activeOverrideThemeId && autoThemeEnabled) {
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDay = today.getDate();

            const matchedHoliday = Object.values(HOLIDAY_THEMES).find(
                h => h.specialDate && h.specialDate.month === todayMonth && h.specialDate.day === todayDay
            );
            if (matchedHoliday) {
                activeOverrideThemeId = matchedHoliday.id;
            }
        }

        if (activeOverrideThemeId) {
            const holidayConfig = HOLIDAY_THEMES[activeOverrideThemeId];
            if (holidayConfig) {
                const overrides = mode === 'light' ? holidayConfig.light : holidayConfig.dark;
                const base = mode === 'light' ? lightTheme : darkTheme;
                return getOverriddenTheme(base, overrides);
            }
        }

        // 3. User custom theme (restricted to admin for now, check user customTheme) has third priority
        if (user?.customTheme) {
            const customThemeConfig = COLOR_THEMES.find(t => t.id === user.customTheme);
            if (customThemeConfig) {
                const overrides = mode === 'light' ? customThemeConfig.light : customThemeConfig.dark;
                const base = mode === 'light' ? lightTheme : darkTheme;
                return getOverriddenTheme(base, overrides);
            }
        }

        return themes[mode];
    }, [mode, overlayType, user?.customTheme, autoThemeEnabled, globalThemeOverride]);

    // Active holiday details (calculated from romantic overlay or current global app settings)
    const activeHoliday = React.useMemo(() => {
        if (overlayType === 'romantic') {
            return {
                id: 'romantic',
                name: "Laura ❤️ Joey",
                description: "Infinite Love is in the air!"
            };
        }

        let activeOverrideThemeId: string | null = globalThemeOverride || null;

        if (!activeOverrideThemeId && autoThemeEnabled) {
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDay = today.getDate();

            const matchedHoliday = Object.values(HOLIDAY_THEMES).find(
                h => h.specialDate && h.specialDate.month === todayMonth && h.specialDate.day === todayDay
            );
            if (matchedHoliday) {
                activeOverrideThemeId = matchedHoliday.id;
            }
        }

        if (activeOverrideThemeId) {
            const holidayConfig = HOLIDAY_THEMES[activeOverrideThemeId];
            if (holidayConfig) {
                return {
                    id: holidayConfig.id,
                    name: holidayConfig.name,
                    description: holidayConfig.description
                };
            }
        }

        return null;
    }, [overlayType, autoThemeEnabled, globalThemeOverride]);

    // Sync native background color with the current theme
    useEffect(() => {
        if (isLoaded) {
            SystemUI.setBackgroundColorAsync(theme.bgPrimary).catch(e => 
                console.error('Failed to sync native background', e)
            );
        }
    }, [theme.bgPrimary, isLoaded]);

    const value = React.useMemo(() => ({
        mode,
        theme,
        toggleTheme,
        triggerOverlay,
        overlayTrigger,
        overlayType,
        refreshThemeSettings,
        activeHoliday
    }), [mode, theme, toggleTheme, triggerOverlay, overlayTrigger, overlayType, refreshThemeSettings, activeHoliday]);

    // Defer rendering until the first successful load from storage
    // to prevent "theme flash" where the app shows the OS theme for a split second.
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => useContext(ThemeContext);
