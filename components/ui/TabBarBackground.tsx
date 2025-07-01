import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

// Custom tab bar background for Android and Web that adapts to theme
export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Use a darker background for dark theme
  const backgroundColor = colorScheme === 'dark' 
    ? colors.background // Use the main background color for better contrast
    : colors.surface;

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
  return 0;
}
