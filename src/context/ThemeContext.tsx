import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkTheme, lightTheme, romanticLightTheme, romanticDarkTheme } from './theme';

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
    const [mode, setMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");
    const [isLoaded, setIsLoaded] = useState(false);
    const [overlayTrigger, setOverlayTrigger] = useState(0);
    const [overlayType, setOverlayType] = useState<string | null>(null);

    useEffect((): void => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme === 'dark' || storedTheme === 'light') {
                    setMode(storedTheme);
                } else {
                    setMode(systemScheme === "dark" ? "dark" : "light");
                }
            } catch (e) {
                setMode(systemScheme === "dark" ? "dark" : "light");
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, [systemScheme]);

    const toggleTheme = async (): Promise<void> => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    if (!isLoaded) return null;

    // Determine current theme based on mode and optional overlay type
    const getTheme = () => {
        if (overlayType === 'romantic') {
            return themes[`romantic${mode.charAt(0).toUpperCase() + mode.slice(1)}` as keyof typeof themes];
        }
        return themes[mode];
    };

    return (
        <ThemeContext.Provider value={{ 
            mode, 
            theme: getTheme(), 
            toggleTheme,
            triggerOverlay: (type) => {
                setOverlayType(type);
                if (type) {
                    setOverlayTrigger(prev => prev + 1);
                } else {
                    setOverlayTrigger(0);
                }
            },
            overlayTrigger,
            overlayType
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => useContext(ThemeContext);
