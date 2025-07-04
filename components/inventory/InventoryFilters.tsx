import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FILTER_CHIPS } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';
import { FilterKey, FilterOptions, ItemWithLocation } from '../../types/inventory';
import {
    getUniqueContainerObjects,
    getUniquePlaceObjects,
    getUniqueRoomObjects,
    getUniqueStatuses,
    getUniqueTagObjects,
    hasActiveAdvancedFilters
} from '../../utils/inventory/filters';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

interface InventoryFiltersProps {
  items: ItemWithLocation[];
  selectedFilter: FilterKey;
  advancedFilters: FilterOptions;
  showAdvancedFilters: boolean;
  onFilterSelect: (filter: FilterKey) => void;
  onToggleAdvancedFilter: (
    category: keyof Pick<FilterOptions, 'roomIds' | 'placeIds' | 'containerIds' | 'tagIds' | 'statuses'>,
    value: number | string
  ) => void;
  onClearAdvancedFilters: () => void;
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

interface ObjectFilterSectionProps {
  title: string;
  options: { id: number; name: string }[];
  selectedValues: number[];
  onToggle: (value: number) => void;
  primaryColor: string;
  backgroundSecondaryColor: string;
  textSecondaryColor: string;
}

export function InventoryFilters({
  items,
  selectedFilter,
  advancedFilters,
  showAdvancedFilters,
  onFilterSelect,
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

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <ScrollView
          style={[styles.advancedFiltersContainer, { backgroundColor: cardColor }]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.advancedFiltersHeader}>
            <ThemedText type="defaultSemiBold" style={[styles.advancedFiltersTitle, { color: textColor }]}>
              Advanced Filters
            </ThemedText>
            {hasActiveFilters && (
              <TouchableOpacity onPress={onClearAdvancedFilters}>
                <ThemedText style={[styles.clearFiltersText, { color: primaryColor }]}>
                  Clear All
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Room Filter */}
          <ObjectFilterSection
            title="Pièces"
            options={getUniqueRoomObjects(items).map(room => ({ id: room.id, name: room.name }))}
            selectedValues={advancedFilters.roomIds}
            onToggle={(value: number) => onToggleAdvancedFilter('roomIds', value)}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Place Filter */}
          <ObjectFilterSection
            title="Endroits"
            options={getUniquePlaceObjects(items).map(place => ({ id: place.id, name: place.name }))}
            selectedValues={advancedFilters.placeIds}
            onToggle={(value: number) => onToggleAdvancedFilter('placeIds', value)}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Container Filter */}
          <ObjectFilterSection
            title="Contenants"
            options={getUniqueContainerObjects(items).map(container => ({ id: container.id, name: container.name }))}
            selectedValues={advancedFilters.containerIds}
            onToggle={(value: number) => onToggleAdvancedFilter('containerIds', value)}
            primaryColor={primaryColor}
            backgroundSecondaryColor={backgroundSecondaryColor}
            textSecondaryColor={textSecondaryColor}
          />

          {/* Tags Filter */}
          <ObjectFilterSection
            title="Tags"
            options={getUniqueTagObjects(items).map(tag => ({ id: tag.id, name: tag.name }))}
            selectedValues={advancedFilters.tagIds}
            onToggle={(value: number) => onToggleAdvancedFilter('tagIds', value)}
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
        </ScrollView>
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

function ObjectFilterSection({
  title,
  options,
  selectedValues,
  onToggle,
  primaryColor,
  backgroundSecondaryColor,
  textSecondaryColor,
}: ObjectFilterSectionProps) {
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
              key={option.id}
              style={[
                styles.filterOption,
                {
                  backgroundColor: selectedValues.includes(option.id)
                    ? primaryColor
                    : backgroundSecondaryColor,
                }
              ]}
              onPress={() => onToggle(option.id)}
            >
              <ThemedText style={[
                styles.filterOptionText,
                {
                  color: selectedValues.includes(option.id)
                    ? '#FFFFFF'
                    : textSecondaryColor
                }
              ]}>
                {option.name}
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
    maxHeight: 400, // Add max height for scrolling
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
