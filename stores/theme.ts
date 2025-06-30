import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeState {
  // State
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  getResolvedTheme: () => ResolvedTheme;
  
  // Internal actions
  updateResolvedTheme: () => void;
}

// Get system theme
const getSystemTheme = (): ResolvedTheme => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

// Resolve theme based on mode
const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === 'auto') {
    return getSystemTheme();
  }
  return mode;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      themeMode: 'auto',
      resolvedTheme: getSystemTheme(),

      // Actions
      setThemeMode: (mode: ThemeMode) => {
        console.log('ThemeStore: Setting theme mode to:', mode);
        const resolved = resolveTheme(mode);
        set({ 
          themeMode: mode,
          resolvedTheme: resolved
        });
        console.log('ThemeStore: Theme mode set, resolved to:', resolved);
      },

      getResolvedTheme: () => {
        const { themeMode } = get();
        return resolveTheme(themeMode);
      },

      updateResolvedTheme: () => {
        const { themeMode } = get();
        const resolved = resolveTheme(themeMode);
        set({ resolvedTheme: resolved });
        console.log('ThemeStore: Theme updated, resolved to:', resolved);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist theme mode, not resolved theme
      partialize: (state) => ({ 
        themeMode: state.themeMode
      }),
      // Update resolved theme after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.updateResolvedTheme();
        }
      },
    }
  )
);

// Listen to system theme changes
let systemThemeListener: any = null;

export const initializeThemeListener = () => {
  // Remove existing listener if any
  if (systemThemeListener) {
    systemThemeListener.remove();
  }

  // Add new listener
  systemThemeListener = Appearance.addChangeListener(({ colorScheme }) => {
    console.log('ThemeStore: System theme changed to:', colorScheme);
    const store = useThemeStore.getState();
    
    // Only update if we're in auto mode
    if (store.themeMode === 'auto') {
      store.updateResolvedTheme();
    }
  });
};

// Clean up listener
export const cleanupThemeListener = () => {
  if (systemThemeListener) {
    systemThemeListener.remove();
    systemThemeListener = null;
  }
};

// Helper hook to get current theme
export const useTheme = () => {
  const { resolvedTheme } = useThemeStore();
  return resolvedTheme;
};

// Helper hook to get theme mode and setter
export const useThemeMode = () => {
  const { themeMode, setThemeMode } = useThemeStore();
  return { themeMode, setThemeMode };
};
