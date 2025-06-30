import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeMode, useThemeMode } from '@/stores/theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeMode) => void;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
  {
    mode: 'light',
    label: 'Light',
    icon: 'sun.max',
    description: 'Always use light theme'
  },
  {
    mode: 'dark',
    label: 'Dark',
    icon: 'moon',
    description: 'Always use dark theme'
  },
  {
    mode: 'auto',
    label: 'Automatic',
    icon: 'circle.lefthalf.filled',
    description: 'Follow system setting'
  }
];

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { themeMode, setThemeMode } = useThemeMode();

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    onThemeChange?.(mode);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={[styles.title, { color: colors.text }]}>
        Theme
      </ThemedText>
      <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
        Choose how the app appears to you
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        {THEME_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              {
                backgroundColor: colors.surface,
                borderColor: themeMode === option.mode ? colors.primary : colors.border,
                borderWidth: themeMode === option.mode ? 2 : 1,
              }
            ]}
            onPress={() => handleThemeSelect(option.mode)}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: themeMode === option.mode ? colors.primary : colors.background
                }
              ]}>
                <IconSymbol
                  name={option.icon as any}
                  size={24}
                  color={themeMode === option.mode ? '#FFFFFF' : colors.textSecondary}
                />
              </View>
              
              <View style={styles.textContainer}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[
                    styles.optionLabel,
                    { color: themeMode === option.mode ? colors.primary : colors.text }
                  ]}
                >
                  {option.label}
                </ThemedText>
                <ThemedText 
                  style={[
                    styles.optionDescription,
                    { color: colors.textSecondary }
                  ]}
                >
                  {option.description}
                </ThemedText>
              </View>
              
              {themeMode === option.mode && (
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  color={colors.primary}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
});
