import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Use a darker background for dark theme, same as Android/Web version
  const backgroundColor = colorScheme === 'dark' 
    ? colors.background // Dark background for better contrast
    : colors.surface;     // Light surface for light theme

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor,
        borderTopColor: colors.border,
        borderTopWidth: 1,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
