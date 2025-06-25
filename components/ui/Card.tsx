import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: boolean;
}

export function Card({ children, style, padding = 16, shadow = true }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      padding,
      ...(shadow && {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }),
    },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatsCard({ title, value, subtitle, icon, color }: StatsCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Card style={styles.statsCard}>
      <View style={styles.statsHeader}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: color || colors.primary }]}>
            {icon}
          </View>
        )}
        <View style={styles.statsContent}>
          <ThemedText type="subtitle" style={[styles.statsValue, { color: color || colors.primary }]}>
            {value}
          </ThemedText>
          <ThemedText style={[styles.statsTitle, { color: colors.textSecondary }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 4,
  },
  statsCard: {
    flex: 1,
    margin: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
