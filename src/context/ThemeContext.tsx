import { darkTheme, lightTheme } from '@/src/context/theme';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type ThemeType = typeof lightTheme;

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => setTheme(prev => (prev === lightTheme ? darkTheme : lightTheme));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
