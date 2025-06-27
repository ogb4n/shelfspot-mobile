import { useTheme } from '@/contexts/ThemeContext';

export function useColorScheme() {
  try {
    const { currentTheme } = useTheme();
    return currentTheme;
  } catch {
    // Fallback si le hook est utilisé en dehors du contexte
    return 'light';
  }
}
