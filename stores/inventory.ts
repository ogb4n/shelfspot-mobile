import { DEBOUNCE_DELAY, DEFAULT_ALERT_THRESHOLD } from '@/constants/inventory';
import { backendApi } from '@/services/backend-api';
import {
    AlertFormData,
    FilterKey,
    FilterOptions,
    ItemFormData,
    ItemWithLocation
} from '@/types/inventory';
import {
    getTriggeredAlerts,
    sortAlertsByPriority,
    transformItemsToItemsWithLocation,
    TriggeredAlert
} from '@/utils/inventory';
import {
    clearAdvancedFilters,
    filterItems
} from '@/utils/inventory/filters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './auth';

// External timeout variable to avoid storing it in Zustand state
let searchTimeout: number | null = null;

export interface InventoryState {
  // Items state
  items: ItemWithLocation[];
  filteredItems: ItemWithLocation[];
  loading: boolean;
  error: string | null;
  
  // Search and filters
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedFilter: FilterKey;
  advancedFilters: FilterOptions;
  
  // Selection state
  isSelectionMode: boolean;
  selectedItems: number[];
  
  // Favorites
  favoriteItems: ItemWithLocation[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  
  // Inventory data (rooms, places, containers, tags)
  rooms: any[];
  places: any[];
  containers: any[];
  tags: any[];
  dataLoading: boolean;
  dataError: string | null;
  
  // Alerts
  allAlerts: any[];
  triggeredAlerts: TriggeredAlert[];
  alertsLoading: boolean;
  alertsError: string | null;
  showAlertsModal: boolean;
  showCreateAlertModal: boolean;
  selectedItemForAlert: number | null;
  alertFormData: AlertFormData;
  
  // Actions - Items
  loadItems: () => Promise<void>;
  addItem: (itemData: ItemFormData) => Promise<void>;
  updateItem: (itemId: number, updates: Partial<ItemFormData>) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
  deleteItems: (itemIds: number[]) => Promise<void>;
  
  // Actions - Search and filters
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: FilterKey) => void;
  toggleAdvancedFilter: (
    category: keyof Pick<FilterOptions, 'roomIds' | 'placeIds' | 'containerIds' | 'tagIds' | 'statuses'>,
    value: number | string
  ) => void;
  clearAllAdvancedFilters: () => void;
  applyFilters: () => void;
  
  // Actions - Selection
  toggleSelectionMode: () => void;
  exitSelectionMode: () => void;
  handleItemSelection: (itemId: number) => void;
  handleSelectAll: (allItemIds: number[]) => void;
  isItemSelected: (itemId: number) => boolean;
  
  // Actions - Favorites
  loadFavorites: () => Promise<void>;
  toggleFavorite: (itemId: number) => Promise<void>;
  addToFavorites: (itemId: number) => Promise<void>;
  removeFromFavorites: (itemId: number) => Promise<void>;
  
  // Actions - Inventory data
  loadInventoryData: () => Promise<void>;
  
  // Actions - Alerts
  loadAlerts: () => Promise<void>;
  createAlert: (alertData: AlertFormData, onSuccess?: () => void) => Promise<void>;
  updateAlert: (alertId: number, updates: Partial<AlertFormData>) => Promise<void>;
  deleteAlert: (alertId: number) => Promise<void>;
  openAlertsModal: () => void;
  closeAlertsModal: () => void;
  openCreateAlertModal: (itemId?: number) => void;
  closeCreateAlertModal: () => void;
  
  // Utility actions
  clearError: () => void;
  clearFavoritesError: () => void;
  clearDataError: () => void;
  clearAlertsError: () => void;
  initialize: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
      (set, get) => ({
        // Initial state
        items: [],
        filteredItems: [],
        loading: false,
        error: null,
        
        searchQuery: '',
        debouncedSearchQuery: '',
        selectedFilter: 'all',
        advancedFilters: {
          search: '',
          roomIds: [],
          placeIds: [],
          containerIds: [],
          tagIds: [],
          statuses: [],
          favoritesOnly: false,
          consumablesOnly: false,
        },
        
        isSelectionMode: false,
        selectedItems: [],
        
        favoriteItems: [],
        favoritesLoading: false,
        favoritesError: null,
        
        rooms: [],
        places: [],
        containers: [],
        tags: [],
        dataLoading: false,
        dataError: null,
        
        allAlerts: [],
        triggeredAlerts: [],
        alertsLoading: false,
        alertsError: null,
        showAlertsModal: false,
        showCreateAlertModal: false,
        selectedItemForAlert: null,
        alertFormData: {
          itemId: 0,
          threshold: DEFAULT_ALERT_THRESHOLD,
          name: '',
          isActive: true,
        },

        // Items actions
        loadItems: async () => {
          try {
            set({ loading: true, error: null });
            const apiItems = await backendApi.getItems();
            const user = useAuthStore.getState().user;
            
            const transformedItems = transformItemsToItemsWithLocation(apiItems, user?.id);
            set({ items: transformedItems });
            
            // Apply current filters
            get().applyFilters();
          } catch (err: any) {
            console.error('Error loading items:', err);
            set({ error: err.message || 'Failed to load items' });
          } finally {
            set({ loading: false });
          }
        },

        addItem: async (itemData: ItemFormData) => {
          try {
            set({ loading: true, error: null });
            
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
            
            await get().loadItems();
          } catch (err: any) {
            console.error('Error adding item:', err);
            set({ error: err.message || 'Failed to add item' });
            throw err;
          } finally {
            set({ loading: false });
          }
        },

        updateItem: async (itemId: number, updates: Partial<ItemFormData>) => {
          try {
            set({ loading: true, error: null });
            await backendApi.updateItem(itemId, updates);
            await get().loadItems();
          } catch (err: any) {
            console.error('Error updating item:', err);
            set({ error: err.message || 'Failed to update item' });
            throw err;
          } finally {
            set({ loading: false });
          }
        },

        deleteItem: async (itemId: number) => {
          try {
            set({ loading: true, error: null });
            await backendApi.deleteItem(itemId);
            
            // Remove item from local state immediately
            const { items } = get();
            set({ items: items.filter(item => item.id !== itemId) });
            get().applyFilters();
          } catch (err: any) {
            console.error('Error deleting item:', err);
            set({ error: err.message || 'Failed to delete item' });
            await get().loadItems(); // Restore state if deletion failed
            throw err;
          } finally {
            set({ loading: false });
          }
        },

        deleteItems: async (itemIds: number[]) => {
          try {
            set({ loading: true, error: null });
            await backendApi.deleteItems(itemIds);
            
            // Remove items from local state immediately
            const { items } = get();
            set({ items: items.filter(item => !itemIds.includes(item.id)) });
            get().applyFilters();
          } catch (err: any) {
            console.error('Error deleting items:', err);
            set({ error: err.message || 'Failed to delete items' });
            await get().loadItems(); // Restore state if deletion failed
            throw err;
          } finally {
            set({ loading: false });
          }
        },

        // Search and filters actions
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
          
          // Debounce the search using external timeout
          if (searchTimeout) {
            clearTimeout(searchTimeout);
          }
          
          searchTimeout = setTimeout(() => {
            set({ debouncedSearchQuery: query });
            get().applyFilters();
          }, DEBOUNCE_DELAY);
        },

        setSelectedFilter: (filter: FilterKey) => {
          set({ selectedFilter: filter });
          get().applyFilters();
        },

        toggleAdvancedFilter: (
          category: keyof Pick<FilterOptions, 'roomIds' | 'placeIds' | 'containerIds' | 'tagIds' | 'statuses'>,
          value: number | string
        ) => {
          const { advancedFilters } = get();
          const currentValues = advancedFilters[category] as (number | string)[];
          const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
          
          set({
            advancedFilters: {
              ...advancedFilters,
              [category]: newValues,
            }
          });
          
          get().applyFilters();
        },

        clearAllAdvancedFilters: () => {
          const { advancedFilters } = get();
          set({
            advancedFilters: {
              ...advancedFilters,
              ...clearAdvancedFilters(),
            }
          });
          get().applyFilters();
        },

        applyFilters: () => {
          const { items, debouncedSearchQuery, selectedFilter, advancedFilters } = get();
          
          const filters: FilterOptions = {
            ...advancedFilters,
            search: debouncedSearchQuery,
            status: selectedFilter === 'all' || selectedFilter === 'favorites' || selectedFilter === 'consumables'
              ? undefined 
              : selectedFilter,
            favoritesOnly: selectedFilter === 'favorites',
            consumablesOnly: selectedFilter === 'consumables',
          };
          
          const filtered = filterItems(items, filters);
          set({ filteredItems: filtered });
        },

        // Selection actions
        toggleSelectionMode: () => {
          const { isSelectionMode } = get();
          set({ 
            isSelectionMode: !isSelectionMode,
            selectedItems: []
          });
        },

        exitSelectionMode: () => {
          set({ 
            isSelectionMode: false,
            selectedItems: []
          });
        },

        handleItemSelection: (itemId: number) => {
          const { selectedItems } = get();
          const newSelection = selectedItems.includes(itemId)
            ? selectedItems.filter(id => id !== itemId)
            : [...selectedItems, itemId];
          
          set({ selectedItems: newSelection });
        },

        handleSelectAll: (allItemIds: number[]) => {
          const { selectedItems } = get();
          const newSelection = selectedItems.length === allItemIds.length
            ? []
            : allItemIds;
          
          set({ selectedItems: newSelection });
        },

        isItemSelected: (itemId: number) => {
          return get().selectedItems.includes(itemId);
        },

        // Favorites actions
        loadFavorites: async () => {
          try {
            set({ favoritesLoading: true, favoritesError: null });
            const favoritesData = await backendApi.getFavorites();
            const user = useAuthStore.getState().user;
            
            const items = favoritesData.map((favorite: any) => favorite.item);
            const transformedItems = transformItemsToItemsWithLocation(items, user?.id);
            
            const favoriteItemsWithFlag = transformedItems.map(item => ({
              ...item,
              isFavorite: true
            }));
            
            set({ favoriteItems: favoriteItemsWithFlag });
          } catch (err: any) {
            console.error('Error loading favorites:', err);
            set({ favoritesError: err.message || 'Failed to load favorites' });
          } finally {
            set({ favoritesLoading: false });
          }
        },

        toggleFavorite: async (itemId: number) => {
          try {
            set({ loading: true, error: null });
            
            const { items } = get();
            const item = items.find(item => item.id === itemId);
            if (!item) return;

            if (item.isFavorite) {
              await backendApi.removeFromFavorites(itemId);
            } else {
              await backendApi.addToFavorites(itemId);
            }
            
            // Update local state immediately
            const updatedItems = items.map(i => 
              i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i
            );
            set({ items: updatedItems });
            get().applyFilters();
          } catch (err: any) {
            console.error('Error toggling favorite:', err);
            set({ error: err.message || 'Failed to toggle favorite' });
            await get().loadItems(); // Restore correct state
          } finally {
            set({ loading: false });
          }
        },

        addToFavorites: async (itemId: number) => {
          try {
            await backendApi.addToFavorites(itemId);
            await get().loadFavorites();
          } catch (err: any) {
            console.error('Error adding to favorites:', err);
            set({ favoritesError: err.message || 'Failed to add to favorites' });
          }
        },

        removeFromFavorites: async (itemId: number) => {
          try {
            await backendApi.removeFromFavorites(itemId);
            
            // Remove from local state immediately
            const { favoriteItems } = get();
            set({ favoriteItems: favoriteItems.filter(item => item.id !== itemId) });
          } catch (err: any) {
            console.error('Error removing from favorites:', err);
            set({ favoritesError: err.message || 'Failed to remove from favorites' });
            await get().loadFavorites(); // Restore state if removal failed
          }
        },

        // Inventory data actions
        loadInventoryData: async () => {
          try {
            set({ dataLoading: true, dataError: null });

            const [roomsData, placesData, containersData, tagsData] = await Promise.all([
              backendApi.getRooms(),
              backendApi.getPlaces(),
              backendApi.getContainers(),
              backendApi.getTags(),
            ]);

            set({
              rooms: roomsData,
              places: placesData,
              containers: containersData,
              tags: tagsData,
            });
          } catch (err: any) {
            console.error('Error loading inventory data:', err);
            set({ dataError: err.message || 'Failed to load inventory data' });
          } finally {
            set({ dataLoading: false });
          }
        },

        // Alerts actions
        loadAlerts: async () => {
          try {
            set({ alertsLoading: true, alertsError: null });
            const alerts = await backendApi.getAlerts();
            set({ allAlerts: alerts });
            
            // Update triggered alerts
            const { items } = get();
            const triggered = sortAlertsByPriority(getTriggeredAlerts(items));
            set({ triggeredAlerts: triggered });
          } catch (err: any) {
            console.error('Error loading alerts:', err);
            set({ alertsError: err.message || 'Failed to load alerts' });
          } finally {
            set({ alertsLoading: false });
          }
        },

        createAlert: async (alertData: AlertFormData, onSuccess?: () => void) => {
          try {
            set({ alertsLoading: true, alertsError: null });
            await backendApi.createAlert(alertData);
            await get().loadAlerts();
            onSuccess?.();
          } catch (err: any) {
            console.error('Error creating alert:', err);
            set({ alertsError: err.message || 'Failed to create alert' });
            throw err;
          } finally {
            set({ alertsLoading: false });
          }
        },

        updateAlert: async (alertId: number, updates: Partial<AlertFormData>) => {
          try {
            set({ alertsLoading: true, alertsError: null });
            await backendApi.updateAlert(alertId, updates);
            await get().loadAlerts();
          } catch (err: any) {
            console.error('Error updating alert:', err);
            set({ alertsError: err.message || 'Failed to update alert' });
            throw err;
          } finally {
            set({ alertsLoading: false });
          }
        },

        deleteAlert: async (alertId: number) => {
          try {
            set({ alertsLoading: true, alertsError: null });
            await backendApi.deleteAlert(alertId);
            await get().loadAlerts();
          } catch (err: any) {
            console.error('Error deleting alert:', err);
            set({ alertsError: err.message || 'Failed to delete alert' });
            throw err;
          } finally {
            set({ alertsLoading: false });
          }
        },

        openAlertsModal: () => set({ showAlertsModal: true }),
        closeAlertsModal: () => set({ showAlertsModal: false }),
        
        openCreateAlertModal: (itemId?: number) => {
          set({ 
            showCreateAlertModal: true,
            selectedItemForAlert: itemId || null,
            alertFormData: {
              itemId: itemId || 0,
              threshold: DEFAULT_ALERT_THRESHOLD,
              name: '',
              isActive: true,
            }
          });
        },
        
        closeCreateAlertModal: () => {
          set({ 
            showCreateAlertModal: false,
            selectedItemForAlert: null
          });
        },

        // Utility actions
        clearError: () => set({ error: null }),
        clearFavoritesError: () => set({ favoritesError: null }),
        clearDataError: () => set({ dataError: null }),
        clearAlertsError: () => set({ alertsError: null }),

        initialize: async () => {
          try {
            console.log('InventoryStore: Initializing inventory');
            await Promise.all([
              get().loadItems(),
              get().loadFavorites(),
              get().loadInventoryData(),
            ]);
            console.log('InventoryStore: Inventory initialized successfully');
          } catch (error) {
            console.error('InventoryStore: Error initializing inventory:', error);
          }
        },
      }),
      {
        name: 'inventory-storage',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist search/filter preferences, not the actual data
        partialize: (state) => ({
          selectedFilter: state.selectedFilter,
          advancedFilters: state.advancedFilters,
        }),
      }
    )
);

// Helper hooks for common patterns
export const useInventoryItems = () => {
  const items = useInventoryStore((state) => state.items);
  const filteredItems = useInventoryStore((state) => state.filteredItems);
  const loading = useInventoryStore((state) => state.loading);
  const error = useInventoryStore((state) => state.error);
  const loadItems = useInventoryStore((state) => state.loadItems);
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);
  const deleteItem = useInventoryStore((state) => state.deleteItem);
  const deleteItems = useInventoryStore((state) => state.deleteItems);
  const toggleFavorite = useInventoryStore((state) => state.toggleFavorite);
  
  return {
    items,
    filteredItems,
    loading,
    error,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    toggleFavorite,
  };
};

export const useInventoryFilters = () => {
  const searchQuery = useInventoryStore((state) => state.searchQuery);
  const selectedFilter = useInventoryStore((state) => state.selectedFilter);
  const advancedFilters = useInventoryStore((state) => state.advancedFilters);
  const setSearchQuery = useInventoryStore((state) => state.setSearchQuery);
  const setSelectedFilter = useInventoryStore((state) => state.setSelectedFilter);
  const toggleAdvancedFilter = useInventoryStore((state) => state.toggleAdvancedFilter);
  const clearAllAdvancedFilters = useInventoryStore((state) => state.clearAllAdvancedFilters);
  
  return {
    searchQuery,
    selectedFilter,
    advancedFilters,
    setSearchQuery,
    setSelectedFilter,
    toggleAdvancedFilter,
    clearAllAdvancedFilters,
  };
};

export const useInventorySelection = () => {
  const isSelectionMode = useInventoryStore((state) => state.isSelectionMode);
  const selectedItems = useInventoryStore((state) => state.selectedItems);
  const selectedItemsCount = useInventoryStore((state) => state.selectedItems.length);
  const toggleSelectionMode = useInventoryStore((state) => state.toggleSelectionMode);
  const exitSelectionMode = useInventoryStore((state) => state.exitSelectionMode);
  const handleItemSelection = useInventoryStore((state) => state.handleItemSelection);
  const handleSelectAll = useInventoryStore((state) => state.handleSelectAll);
  const isItemSelected = useInventoryStore((state) => state.isItemSelected);
  
  return {
    isSelectionMode,
    selectedItems,
    selectedItemsCount,
    toggleSelectionMode,
    exitSelectionMode,
    handleItemSelection,
    handleSelectAll,
    isItemSelected,
  };
};

export const useInventoryFavorites = () => {
  const favoriteItems = useInventoryStore((state) => state.favoriteItems);
  const favoritesLoading = useInventoryStore((state) => state.favoritesLoading);
  const favoritesError = useInventoryStore((state) => state.favoritesError);
  const loadFavorites = useInventoryStore((state) => state.loadFavorites);
  const addToFavorites = useInventoryStore((state) => state.addToFavorites);
  const removeFromFavorites = useInventoryStore((state) => state.removeFromFavorites);
  const clearFavoritesError = useInventoryStore((state) => state.clearFavoritesError);
  
  return {
    favoriteItems,
    favoritesLoading,
    favoritesError,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    clearFavoritesError,
  };
};

export const useInventoryData = () => {
  const rooms = useInventoryStore((state) => state.rooms);
  const places = useInventoryStore((state) => state.places);
  const containers = useInventoryStore((state) => state.containers);
  const tags = useInventoryStore((state) => state.tags);
  const dataLoading = useInventoryStore((state) => state.dataLoading);
  const dataError = useInventoryStore((state) => state.dataError);
  const loadInventoryData = useInventoryStore((state) => state.loadInventoryData);
  const clearDataError = useInventoryStore((state) => state.clearDataError);
  
  return {
    rooms,
    places,
    containers,
    tags,
    dataLoading,
    dataError,
    loadInventoryData,
    clearDataError,
  };
};

export const useInventoryAlerts = () => {
  const allAlerts = useInventoryStore((state) => state.allAlerts);
  const triggeredAlerts = useInventoryStore((state) => state.triggeredAlerts);
  const alertsLoading = useInventoryStore((state) => state.alertsLoading);
  const alertsError = useInventoryStore((state) => state.alertsError);
  const showAlertsModal = useInventoryStore((state) => state.showAlertsModal);
  const showCreateAlertModal = useInventoryStore((state) => state.showCreateAlertModal);
  const selectedItemForAlert = useInventoryStore((state) => state.selectedItemForAlert);
  const alertFormData = useInventoryStore((state) => state.alertFormData);
  const loadAlerts = useInventoryStore((state) => state.loadAlerts);
  const createAlert = useInventoryStore((state) => state.createAlert);
  const updateAlert = useInventoryStore((state) => state.updateAlert);
  const deleteAlert = useInventoryStore((state) => state.deleteAlert);
  const openAlertsModal = useInventoryStore((state) => state.openAlertsModal);
  const closeAlertsModal = useInventoryStore((state) => state.closeAlertsModal);
  const openCreateAlertModal = useInventoryStore((state) => state.openCreateAlertModal);
  const closeCreateAlertModal = useInventoryStore((state) => state.closeCreateAlertModal);
  const clearAlertsError = useInventoryStore((state) => state.clearAlertsError);
  
  return {
    allAlerts,
    triggeredAlerts,
    alertsLoading,
    alertsError,
    showAlertsModal,
    showCreateAlertModal,
    selectedItemForAlert,
    alertFormData,
    loadAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    openAlertsModal,
    closeAlertsModal,
    openCreateAlertModal,
    closeCreateAlertModal,
    clearAlertsError,
  };
};
