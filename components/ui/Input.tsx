import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  style,
  ...textInputProps 
}: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={[styles.label, { color: colors.text }]}>
          {label}
        </ThemedText>
      )}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: error ? colors.error : colors.border,
        }
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            { 
              color: colors.text,
              flex: 1,
            },
            style
          ]}
          placeholderTextColor={colors.textSecondary}
          {...textInputProps}
        />
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
});
