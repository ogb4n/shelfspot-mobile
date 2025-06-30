import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  hapticFeedback?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  style,
  icon,
  hapticFeedback = true
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

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
        backgroundColor: isDisabled ? colors.border : colors.primary,
      },
      secondary: {
        backgroundColor: isDisabled ? colors.border : colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDisabled ? colors.border : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return [base, sizes[size], variants[variant]];
  };

  const getTextColor = () => {
    if (isDisabled) return colors.textSecondary;
    
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
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={{ marginRight: icon || title ? 8 : 0 }}
        />
      )}
      {!loading && icon}
      {(title && !loading) || (title && loading) ? (
        <ThemedText style={{ color: getTextColor(), fontWeight: '600' }}>
          {title}
        </ThemedText>
      ) : null}
    </TouchableOpacity>
  );
}
