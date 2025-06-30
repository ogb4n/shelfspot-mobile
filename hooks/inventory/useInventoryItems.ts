import { useEffect, useState } from 'react';
import { DEBOUNCE_DELAY } from '../../constants/inventory';
import { backendApi } from '../../services/backend-api';
import { useAuthStore } from '../../stores/auth';
import { FilterKey, FilterOptions, ItemFormData, ItemWithLocation } from '../../types/inventory';
import { clearAdvancedFilters, filterItems } from '../../utils/inventory/filters';
import { transformItemsToItemsWithLocation } from '../../utils/inventory/transforms';

export const useInventoryItems = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ItemWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all');
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    search: '',
    roomIds: [],
    placeIds: [],
    containerIds: [],
    tagIds: [],
    statuses: [],
    favoritesOnly: false,
    consumablesOnly: false,
  });

  // Load items from API
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiItems = await backendApi.getItems();
      
      // Transform API items to ItemWithLocation format
      const transformedItems = transformItemsToItemsWithLocation(apiItems, user?.id);
      setItems(transformedItems);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters when search or selected filter changes
  useEffect(() => {
    setAdvancedFilters(prev => ({
      ...prev,
      search: debouncedSearchQuery,
      status: selectedFilter === 'all' || selectedFilter === 'favorites' || selectedFilter === 'consumables'
        ? undefined 
        : selectedFilter,
      favoritesOnly: selectedFilter === 'favorites',
      consumablesOnly: selectedFilter === 'consumables',
    }));
  }, [debouncedSearchQuery, selectedFilter]);

  // Filter items
  const filteredItems = filterItems(items, advancedFilters);

  // Filter functions
  const toggleAdvancedFilter = (
    category: keyof Pick<FilterOptions, 'roomIds' | 'placeIds' | 'containerIds' | 'tagIds' | 'statuses'>,
    value: number | string
  ) => {
    setAdvancedFilters(prev => {
      const currentValues = prev[category] as (number | string)[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [category]: newValues };
    });
  };

  const clearAllAdvancedFilters = () => {
    setAdvancedFilters(prev => ({
      ...prev,
      ...clearAdvancedFilters(),
    }));
  };

  // Item operations
  const addItem = async (itemData: ItemFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await backendApi.createItem({
        name: itemData.name,
        quantity: itemData.quantity,
        status: itemData.status,
        consumable: itemData.consumable,
        price: itemData.price,
        sellprice: itemData.sellprice,
        placeId: itemData.placeId,
        roomId: itemData.roomId,
        containerId: itemData.containerId,
        itemLink: itemData.itemLink,
      });
      
      // Reload items to get the updated list
      await loadItems();
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, updates: Partial<ItemFormData>) => {
    try {
      setLoading(true);
      setError(null);
      
      await backendApi.updateItem(itemId, updates);
      
      // Reload items to get the updated list
      await loadItems();
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await backendApi.deleteItem(itemId);
      
      // Remove item from local state immediately for better UX
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete item');
      // Reload items to restore state if deletion failed
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  const deleteItems = async (itemIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      await backendApi.deleteItems(itemIds);
      
      // Remove items from local state immediately for better UX
      setItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    } catch (err: any) {
      console.error('Error deleting items:', err);
      setError(err.message || 'Failed to delete items');
      // Reload items to restore state if deletion failed
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  // Note: Favorites functionality integrated with backend API
  const toggleFavorite = async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const item = items.find(item => item.id === itemId);
      if (!item) return;

      if (item.isFavorite) {
        await backendApi.removeFromFavorites(itemId);
      } else {
        await backendApi.addToFavorites(itemId);
      }
      
      // Update local state immediately for better UX
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
      ));
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      setError(err.message || 'Failed to toggle favorite');
      // Reload items to restore correct state if toggle failed
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    items,
    filteredItems,
    loading,
    error,
    searchQuery,
    selectedFilter,
    advancedFilters,
    
    // Actions
    setSearchQuery,
    setSelectedFilter,
    toggleAdvancedFilter,
    clearAllAdvancedFilters,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    toggleFavorite,
    loadItems, // Expose loadItems for manual refresh
  };
};
