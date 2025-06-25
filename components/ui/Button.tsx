import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  style,
  icon 
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getButtonStyle = () => {
    const base = {
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      gap: 8,
    };

    const sizes = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 52 },
    };

    const variants = {
      primary: {
        backgroundColor: disabled ? colors.border : colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? colors.border : colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? colors.border : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return [base, sizes[size], variants[variant]];
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
      <ThemedText style={{ color: getTextColor(), fontWeight: '600' }}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}
