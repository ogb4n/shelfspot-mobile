import { ITEM_STATUSES } from '../../constants/inventory';
import { FilterOptions, ItemStatus, ItemWithLocation } from '../../types/inventory';

export const getStatusColor = (status: ItemStatus | undefined): string => {
  const statusConfig = ITEM_STATUSES.find(s => s.value === status);
  return statusConfig?.color || '#6B7280';
};

export const getStatusText = (status: ItemStatus | undefined): string => {
  const statusConfig = ITEM_STATUSES.find(s => s.value === status);
  return statusConfig?.label || status || 'Inconnu';
};

export const filterItems = (
  items: ItemWithLocation[],
  filters: FilterOptions
): ItemWithLocation[] => {
  return items.filter(item => {
    // Search filter
    const matchesSearch = filters.search === '' || 
      item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.location.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.tags.some(tag => tag.name.toLowerCase().includes(filters.search.toLowerCase()));

    // Status filter
    const matchesStatus = !filters.status || item.status === filters.status;

    // Favorites filter
    const matchesFavorites = !filters.favoritesOnly || item.isFavorite;

    // Consumables filter
    const matchesConsumables = !filters.consumablesOnly || item.consumable;

    // Room filter
    const matchesRoom = filters.roomIds.length === 0 || 
      (item.roomId && filters.roomIds.includes(item.roomId));

    // Place filter
    const matchesPlace = filters.placeIds.length === 0 || 
      (item.placeId && filters.placeIds.includes(item.placeId));

    // Container filter
    const matchesContainer = filters.containerIds.length === 0 || 
      (item.containerId && filters.containerIds.includes(item.containerId));

    // Tags filter
    const matchesTags = filters.tagIds.length === 0 || 
      filters.tagIds.some(tagId => item.tags.some(tag => tag.id === tagId));

    // Multiple statuses filter
    const matchesStatuses = filters.statuses.length === 0 || 
      (item.status && filters.statuses.includes(item.status));

    return matchesSearch && 
           matchesStatus && 
           matchesFavorites && 
           matchesConsumables &&
           matchesRoom && 
           matchesPlace && 
           matchesContainer && 
           matchesTags && 
           matchesStatuses;
  });
};

export const getUniqueValues = <T>(
  items: ItemWithLocation[],
  getValue: (item: ItemWithLocation) => T | undefined
): T[] => {
  const values = items
    .map(getValue)
    .filter((value): value is T => value !== undefined);
  return [...new Set(values)];
};

export const getUniqueRooms = (items: ItemWithLocation[]) => 
  getUniqueValues(items, item => item.room?.name);

export const getUniquePlaces = (items: ItemWithLocation[]) => 
  getUniqueValues(items, item => item.place?.name);

export const getUniqueContainers = (items: ItemWithLocation[]) => 
  getUniqueValues(items, item => item.container?.name);

export const getUniqueTags = (items: ItemWithLocation[]) => {
  const allTags = items.flatMap(item => item.tags);
  const uniqueTagNames = [...new Set(allTags.map(tag => tag.name))];
  return uniqueTagNames;
};

export const getUniqueStatuses = (items: ItemWithLocation[]) => 
  getUniqueValues(items, item => item.status);

export const hasActiveAdvancedFilters = (filters: FilterOptions): boolean => {
  return filters.roomIds.length > 0 ||
         filters.placeIds.length > 0 ||
         filters.containerIds.length > 0 ||
         filters.tagIds.length > 0 ||
         filters.statuses.length > 0;
};

export const clearAdvancedFilters = (): Partial<FilterOptions> => ({
  roomIds: [],
  placeIds: [],
  containerIds: [],
  tagIds: [],
  statuses: [],
  consumablesOnly: false,
});
