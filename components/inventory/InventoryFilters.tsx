import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { FilterKey, FilterOptions, ItemWithLocation } from '../../types/inventory';
import { FILTER_CHIPS } from '../../constants/inventory';
import { 
  getUniqueRooms, 
  getUniquePlaces, 
  getUniqueContainers, 
  getUniqueTags, 
  getUniqueStatuses,
  hasActiveAdvancedFilters 
} from '../../utils/inventory/filters';
import { useThemeColor } from '../../hooks/useThemeColor';

interface InventoryFiltersProps {
  items: ItemWithLocation[];
  selectedFilter: FilterKey;
  advancedFilters: FilterOptions;
  showAdvancedFilters: boolean;
  onFilterSelect: (filter: FilterKey) => void;
  onToggleAdvancedFilters: () => void;
  onToggleAdvancedFilter: (
    category: keyof Pick<FilterOptions, 'roomIds' | 'placeIds' | 'containerIds' | 'tagIds' | 'statuses'>,
    value: number | string
  ) => void;
  onClearAdvancedFilters: () => void;
}

export function InventoryFilters({
  items,
  selectedFilter,
  advancedFilters,
  showAdvancedFilters,
  onFilterSelect,
  onToggleAdvancedFilters,
  onToggleAdvancedFilter,
  onClearAdvancedFilters,
}: InventoryFiltersProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundSecondaryColor = useThemeColor({}, 'backgroundSecondary');

  const hasActiveFilters = hasActiveAdvancedFilters(advancedFilters);

  return (
    <View>
      {/* Basic Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTER_CHIPS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilter === filter.key 
                  ? primaryColor 
                  : backgroundSecondaryColor,
              }
            ]}
            onPress={() => onFilterSelect(filter.key)}
          >
            <IconSymbol 
              name={filter.icon as any} 
              size={16} 
              color={selectedFilter === filter.key ? '#FFFFFF' : textSecondaryColor} 
            />
            <ThemedText style={[
              styles.filterText,
              { color: selectedFilter === filter.key ? '#FFFFFF' : textSecondaryColor }
            ]}>
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advanced Filters Toggle */}
      <TouchableOpacity 
        style={[styles.advancedToggle, { backgroundColor: backgroundSecondaryColor }]}
        onPress={onToggleAdvancedFilters}
      >
        <IconSymbol 
          name={showAdvancedFilters ? "chevron.up" : "slider.horizontal.3"} 
          size={20} 
          color={hasActiveFilters ? primaryColor : textSecondaryColor} 
        />
        <ThemedText style={[
          styles.advancedToggleText,
          { color: hasActiveFilters ? primaryColor : textSecondaryColor }
        ]}>
          Filtres avancés
        </ThemedText>
        {hasActiveFilters && (
          <View style={[styles.activeFiltersBadge, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.activeFiltersBadgeText}>
              {[
                ...advancedFilters.roomIds,
                ...advancedFilters.placeIds,
                ...advancedFilters.containerIds,
                ...advancedFilters.tagIds,
                ...advancedFilters.statuses,
              ].length}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <View style={[styles.advancedFiltersContainer, { backgroundColor: cardColor }]}>
          <View style={styles.advancedFiltersHeader}>
            <ThemedText type="defaultSemiBold" style={[styles.advancedFiltersTitle, { color: textColor }]}>
              Filtres avancés
            </ThemedText>
            {hasActiveFilters && (
              <TouchableOpacity onPress={onClearAdvancedFilters}>
                <ThemedText style={[styles.clearFiltersText, { color: primaryColor }]}>
                  Effacer tout
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Room Filter */}
          <FilterSection
            title="Pièces"
            options={getUniqueRooms(items)}
            selectedValues={advancedFilters.roomIds.map(String)}
            onToggle={(value) => onToggleAdvancedFilter('roomIds', parseInt(value))}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Place Filter */}
          <FilterSection
            title="Endroits"
            options={getUniquePlaces(items)}
            selectedValues={advancedFilters.placeIds.map(String)}
            onToggle={(value) => onToggleAdvancedFilter('placeIds', parseInt(value))}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Container Filter */}
          <FilterSection
            title="Contenants"
            options={getUniqueContainers(items)}
            selectedValues={advancedFilters.containerIds.map(String)}
            onToggle={(value) => onToggleAdvancedFilter('containerIds', parseInt(value))}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Tags Filter */}
          <FilterSection
            title="Tags"
            options={getUniqueTags(items)}
            selectedValues={advancedFilters.tagIds.map(String)}
            onToggle={(value) => onToggleAdvancedFilter('tagIds', parseInt(value))}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Status Filter */}
          <FilterSection
            title="Statuts"
            options={getUniqueStatuses(items)}
            selectedValues={advancedFilters.statuses}
            onToggle={(value) => onToggleAdvancedFilter('statuses', value)}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />
        </View>
      )}
    </View>
  );
}

interface FilterSectionProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  primaryColor: string;
  backgroundSecondaryColor: string;
  textSecondaryColor: string;
}

function FilterSection({
  title,
  options,
  selectedValues,
  onToggle,
  primaryColor,
  backgroundSecondaryColor,
  textSecondaryColor,
}: FilterSectionProps) {
  if (options.length === 0) return null;

  return (
    <View style={styles.filterSection}>
      <ThemedText style={[styles.filterSectionTitle, { color: textSecondaryColor }]}>
        {title}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                {
                  backgroundColor: selectedValues.includes(option) 
                    ? primaryColor 
                    : backgroundSecondaryColor,
                }
              ]}
              onPress={() => onToggle(option)}
            >
              <ThemedText style={[
                styles.filterOptionText,
                { 
                  color: selectedValues.includes(option) 
                    ? '#FFFFFF' 
                    : textSecondaryColor 
                }
              ]}>
                {option}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    marginBottom: 16,
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    minHeight: 40,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  advancedToggleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  activeFiltersBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  activeFiltersBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  advancedFiltersContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advancedFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedFiltersTitle: {
    fontSize: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
