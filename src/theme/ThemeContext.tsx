import React, { createContext, useState, useContext, ReactNode } from 'react';
import { lightTheme, darkTheme } from '@/src/theme/theme';

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
