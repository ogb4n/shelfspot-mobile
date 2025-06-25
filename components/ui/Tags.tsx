import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors, TagColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TagProps {
  text: string;
  color?: string;
  size?: 'small' | 'medium';
  onPress?: () => void;
}

export function Tag({ text, color, size = 'medium', onPress }: TagProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const tagColor = color || TagColors[Math.floor(Math.random() * TagColors.length)];
  
  const tagStyle = [
    styles.tag,
    size === 'small' ? styles.tagSmall : styles.tagMedium,
    { backgroundColor: `${tagColor}20` },
  ];

  const textStyle = [
    styles.tagText,
    size === 'small' ? styles.tagTextSmall : styles.tagTextMedium,
    { color: tagColor },
  ];

  return (
    <View style={tagStyle}>
      <ThemedText style={textStyle}>
        {text}
      </ThemedText>
    </View>
  );
}

interface StatusBadgeProps {
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const statusConfig = {
    available: { text: 'Disponible', color: colors.success },
    running_low: { text: 'Stock faible', color: colors.warning },
    out_of_stock: { text: 'Épuisé', color: colors.error },
    expired: { text: 'Expiré', color: '#805AD5' },
  };

  const config = statusConfig[status];
  
  const badgeStyle = [
    styles.badge,
    size === 'small' ? styles.badgeSmall : styles.badgeMedium,
    { backgroundColor: `${config.color}20` },
  ];

  const textStyle = [
    styles.badgeText,
    size === 'small' ? styles.badgeTextSmall : styles.badgeTextMedium,
    { color: config.color },
  ];

  return (
    <View style={badgeStyle}>
      <ThemedText style={textStyle}>
        {config.text}
      </ThemedText>
    </View>
  );
}

interface BreadcrumbProps {
  items: string[];
  onItemPress?: (index: number) => void;
}

export function Breadcrumb({ items, onItemPress }: BreadcrumbProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.breadcrumb}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ThemedText 
            style={[
              styles.breadcrumbItem,
              { color: index === items.length - 1 ? colors.text : colors.textSecondary }
            ]}
            onPress={() => onItemPress?.(index)}
          >
            {item}
          </ThemedText>
          {index < items.length - 1 && (
            <ThemedText style={[styles.breadcrumbSeparator, { color: colors.textSecondary }]}>
              /
            </ThemedText>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 4,
  },
  tagSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontWeight: '500',
  },
  tagTextSmall: {
    fontSize: 12,
  },
  tagTextMedium: {
    fontSize: 14,
  },
  badge: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '500',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
  badgeTextMedium: {
    fontSize: 12,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  breadcrumbItem: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  breadcrumbSeparator: {
    fontSize: 14,
    marginHorizontal: 4,
  },
});
