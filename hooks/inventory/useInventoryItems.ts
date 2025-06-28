import { useState, useEffect } from 'react';
import { ItemWithLocation, FilterOptions, FilterKey, ItemFormData } from '../../types/inventory';
import { filterItems, clearAdvancedFilters } from '../../utils/inventory/filters';
import { DEBOUNCE_DELAY } from '../../constants/inventory';

// Mock data for development - should be replaced with API calls
const mockItems: ItemWithLocation[] = [
  {
    id: 1,
    name: 'Dentifrice Colgate',
    quantity: 2,
    status: 'running_low',
    consumable: true,
    location: 'Salle de bain → Armoire → Étagère du haut',
    roomId: 1,
    placeId: 1,
    containerId: 1,
    room: { id: 1, name: 'Salle de bain' },
    place: { id: 1, name: 'Armoire', roomId: 1 },
    container: { id: 1, name: 'Étagère du haut', placeId: 1 },
    tags: [
      { id: 1, name: 'hygiène' },
      { id: 2, name: 'consommable' }
    ],
    isFavorite: false,
    activeAlerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Yaourts nature',
    quantity: 0,
    status: 'out_of_stock',
    consumable: true,
    location: 'Cuisine → Réfrigérateur → Étagère du milieu',
    roomId: 2,
    placeId: 2,
    containerId: 2,
    room: { id: 2, name: 'Cuisine' },
    place: { id: 2, name: 'Réfrigérateur', roomId: 2 },
    container: { id: 2, name: 'Étagère du milieu', placeId: 2 },
    tags: [
      { id: 3, name: 'nourriture' },
      { id: 4, name: 'périssable' }
    ],
    isFavorite: true,
    activeAlerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Piles AA',
    quantity: 8,
    status: 'available',
    consumable: false,
    location: 'Bureau → Tiroir → Compartiment électronique',
    roomId: 3,
    placeId: 3,
    containerId: 3,
    room: { id: 3, name: 'Bureau' },
    place: { id: 3, name: 'Tiroir', roomId: 3 },
    container: { id: 3, name: 'Compartiment électronique', placeId: 3 },
    tags: [
      { id: 5, name: 'électronique' },
      { id: 6, name: 'utile' }
    ],
    isFavorite: true,
    activeAlerts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useInventoryItems = () => {
  const [items, setItems] = useState<ItemWithLocation[]>(mockItems);
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
  });

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
      status: selectedFilter === 'all' || selectedFilter === 'favorites' 
        ? undefined 
        : selectedFilter,
      favoritesOnly: selectedFilter === 'favorites',
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
  const addItem = (itemData: ItemFormData) => {
    const newItem: ItemWithLocation = {
      id: Date.now(),
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
      location: 'Non localisé', // Will be computed based on room/place/container
      tags: [], // Will be populated from tagIds
      isFavorite: false,
      activeAlerts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (itemId: number, updates: Partial<ItemWithLocation>) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const deleteItems = (itemIds: number[]) => {
    setItems(prev => prev.filter(item => !itemIds.includes(item.id)));
  };

  const toggleFavorite = (itemId: number) => {
    updateItem(itemId, { 
      isFavorite: !items.find(item => item.id === itemId)?.isFavorite 
    });
  };

  return {
    // State
    items,
    filteredItems,
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
  };
};
