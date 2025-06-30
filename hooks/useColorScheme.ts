import { useTheme } from '@/stores/theme';

export function useColorScheme() {
  return useTheme();
}
