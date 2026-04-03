import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkTheme, lightTheme, romanticLightTheme, romanticDarkTheme } from './theme';
import * as SystemUI from 'expo-system-ui';

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
    mode: ThemeMode;
    theme: typeof lightTheme;
    toggleTheme: () => void;
    triggerOverlay: (type: string | null) => void;
    overlayTrigger: number;
    overlayType: string | null;
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
});


export const ThemeProvider = ({ children }: { children: ReactNode }): ReactNode => {
    const systemScheme: ColorSchemeName = useColorScheme(); // "light" | "dark"
    const [mode, setMode] = useState<ThemeMode>("dark"); // Default to dark for fail-safe initialization
    const [isLoaded, setIsLoaded] = useState(false);
    const [overlayTrigger, setOverlayTrigger] = useState(0);
    const [overlayType, setOverlayType] = useState<string | null>(null);

    useEffect((): void => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme === 'dark' || storedTheme === 'light') {
                    setMode(storedTheme);
                } else if (systemScheme) {
                    setMode(systemScheme);
                } else {
                    setMode("dark"); // Absolute fall-safe
                }
            } catch (e) {
                setMode("dark"); // Error fall-safe
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, [systemScheme]);

    const toggleTheme = React.useCallback((): void => {
        setMode(prev => prev === "light" ? "dark" : "light");
    }, []);

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

    // Determine current theme based on mode and optional overlay type
    const theme = React.useMemo(() => {
        if (overlayType === 'romantic') {
            const romanticKey = `romantic${mode.charAt(0).toUpperCase() + mode.slice(1)}` as keyof typeof themes;
            return themes[romanticKey] || themes[mode];
        }
        return themes[mode];
    }, [mode, overlayType]);

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
        overlayType
    }), [mode, theme, toggleTheme, triggerOverlay, overlayTrigger, overlayType]);

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
