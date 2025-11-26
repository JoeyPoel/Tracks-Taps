import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import { darkTheme, lightTheme } from './theme';
import {ColorSchemeName, useColorScheme} from "react-native";
import {JSX} from "react/jsx-runtime";

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

const ThemeContext = createContext<ThemeContextProps>({
    mode: "light",
    theme: lightTheme,
    toggleTheme: (): void => {},
});


export const ThemeProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const systemScheme: ColorSchemeName = useColorScheme(); // "light" | "dark"
    const [mode, setMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");

    useEffect((): void => {
        setMode(systemScheme === "dark" ? "dark" : "light");
    }, [systemScheme]);

    const toggleTheme = (): void =>
        setMode(prev => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeContext.Provider value={{ mode, theme: themes[mode], toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => useContext(ThemeContext);
