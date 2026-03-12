import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAlternateAppIcon } from 'expo-alternate-app-icons';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from './ThemeContext';

export type AppIconId = 'auto' | 'colouredDark' | 'colouredWhite' | 'simpleDark' | 'simpleWhite';

interface AppIconContextProps {
  iconId: AppIconId;
  setIconId: (id: AppIconId) => Promise<void>;
}

const ICON_STORAGE_KEY = '@app_icon_preference';

const AppIconContext = createContext<AppIconContextProps | undefined>(undefined);

const ICON_MAP: Record<string, string | null> = {
  colouredDark: 'App Icon Coloured Dark Theme',
  colouredWhite: 'App Icon Coloured White Theme',
  simpleDark: 'App Icon Dark theme',
  simpleWhite: 'App Icon White theme',
};

export const AppIconProvider = ({ children }: { children: ReactNode }) => {
  const { mode } = useTheme();
  const [iconId, setIconIdState] = useState<AppIconId>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(ICON_STORAGE_KEY);
        if (stored) {
          setIconIdState(stored as AppIconId);
        }
      } catch (e) {
        console.error('Failed to load icon preference', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreference();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const updateIcon = async () => {
      let targetIconName: string | null = null;

      if (iconId === 'auto') {
        targetIconName = mode === 'dark' ? ICON_MAP.colouredDark : ICON_MAP.colouredWhite;
      } else {
        targetIconName = ICON_MAP[iconId];
      }

      try {
        await setAlternateAppIcon(targetIconName);
      } catch (e) {
        console.warn('Failed to set alternate app icon. This only works on physical iOS devices after a native rebuild.', e);
      }
    };

    updateIcon();
  }, [iconId, mode, isLoaded]);

  const setIconId = async (id: AppIconId) => {
    setIconIdState(id);
    try {
      await AsyncStorage.setItem(ICON_STORAGE_KEY, id);
    } catch (e) {
      console.error('Failed to save icon preference', e);
    }
  };

  return (
    <AppIconContext.Provider value={{ iconId, setIconId }}>
      {children}
    </AppIconContext.Provider>
  );
};

export const useAppIcon = () => {
  const context = useContext(AppIconContext);
  if (context === undefined) {
    throw new Error('useAppIcon must be used within an AppIconProvider');
  }
  return context;
};
