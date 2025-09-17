import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

export interface ThemeSettings {
  isDarkMode: boolean;
  isCompactUI: boolean;
  primaryColor: string;
}

export interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (updates: Partial<ThemeSettings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  toggleCompactUI: () => Promise<void>;
  colors: typeof Colors;
  isLoaded: boolean;
}

const defaultSettings: ThemeSettings = {
  isDarkMode: false,
  isCompactUI: false,
  primaryColor: Colors.primary,
};

// Dark mode color palette
const darkColors = {
  ...Colors,
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    light: '#808080',
    white: '#FFFFFF',
  },
};

const defaultThemeContext: ThemeContextType = {
  settings: defaultSettings,
  updateSettings: async () => {},
  toggleDarkMode: async () => {},
  toggleCompactUI: async () => {},
  colors: Colors,
  isLoaded: false,
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  // Move any logging to useEffect to avoid render-time side effects
  useEffect(() => {
    console.log('[ThemeStore] Theme settings loaded:', { settings, isLoaded });
  }, [settings, isLoaded]);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('theme_settings');
      const parsed = safeJsonParse<ThemeSettings>(savedSettings);
      if (parsed) {
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (updates: Partial<ThemeSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      const settingsJson = safeJsonStringify(newSettings);
      if (settingsJson) {
        await AsyncStorage.setItem('theme_settings', settingsJson);
      }
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  }, [settings]);

  const toggleDarkMode = useCallback(async () => {
    await updateSettings({ isDarkMode: !settings.isDarkMode });
  }, [settings.isDarkMode, updateSettings]);

  const toggleCompactUI = useCallback(async () => {
    await updateSettings({ isCompactUI: !settings.isCompactUI });
  }, [settings.isCompactUI, updateSettings]);

  const colors = useMemo(() => {
    return settings.isDarkMode ? darkColors : Colors;
  }, [settings.isDarkMode]);

  return useMemo(() => ({
    settings,
    updateSettings,
    toggleDarkMode,
    toggleCompactUI,
    colors,
    isLoaded,
  }), [settings, updateSettings, toggleDarkMode, toggleCompactUI, colors, isLoaded]);
}, defaultThemeContext);