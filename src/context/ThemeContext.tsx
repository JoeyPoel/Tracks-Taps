import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkTheme, lightTheme } from './theme';

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
    mode: ThemeMode;
    theme: typeof lightTheme;
    toggleTheme: () => void;
}

const themes = {
    light: lightTheme,
    dark: darkTheme,
}

const THEME_STORAGE_KEY = '@app_theme_mode';

const ThemeContext = createContext<ThemeContextProps>({
    mode: "light",
    theme: lightTheme,
    toggleTheme: (): void => { },
});


export const ThemeProvider = ({ children }: { children: ReactNode }): ReactNode => {
    const systemScheme: ColorSchemeName = useColorScheme(); // "light" | "dark"
    const [mode, setMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");
    const [isLoaded, setIsLoaded] = useState(false);

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

    return (
        <ThemeContext.Provider value={{ mode, theme: themes[mode], toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => useContext(ThemeContext);
