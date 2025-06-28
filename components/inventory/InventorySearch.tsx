import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '../ui/IconSymbol';

interface InventorySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

export function InventorySearch({
  searchQuery,
  onSearchChange,
  showAdvancedFilters,
  hasActiveFilters,
  onToggleAdvancedFilters,
}: InventorySearchProps) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={[styles.searchContainer, { backgroundColor }]}>
      <IconSymbol name="magnifyingglass" size={20} color={textSecondaryColor} />
      <TextInput
        style={[styles.searchInput, { color: textColor }]}
        placeholder="Search for an item..."
        placeholderTextColor={textSecondaryColor}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      <TouchableOpacity onPress={onToggleAdvancedFilters} style={styles.filterButton}>
        <IconSymbol
          name={showAdvancedFilters ? "chevron.up" : "slider.horizontal.3"}
          size={20}
          color={hasActiveFilters ? primaryColor : textSecondaryColor}
        />
        {hasActiveFilters && (
          <View style={[styles.activeFiltersBadge, { backgroundColor: primaryColor }]}>
            <View style={styles.activeFiltersIndicator} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    position: 'relative',
  },
  activeFiltersBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeFiltersIndicator: {
    flex: 1,
  },
});
