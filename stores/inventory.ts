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
  transformItemToItemWithLocation,
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
  
  // Local item-tag associations (temporary until backend supports it)
  itemTagAssociations: { [itemId: number]: number[] };
  
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
  updateItemLocal: (itemId: number, updates: Partial<ItemWithLocation>) => void;
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
  syncFavoritesWithItems: () => void;
  
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
        
        // Local item-tag associations (temporary until backend supports it)
        itemTagAssociations: {},
        
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
            const { itemTagAssociations, tags } = get();
            
            // Transform items and include local tag associations
            const transformedItems = apiItems.map((item: any) => {
              const transformed = transformItemToItemWithLocation(item, user?.id);
              
              // Add local tags if any exist for this item
              const localTagIds = itemTagAssociations[item.id] || [];
              if (localTagIds.length > 0) {
                console.log(`Adding local tags to item ${item.id} (${item.name}):`, localTagIds);
                const localTags = localTagIds.map(tagId => {
                  const tag = tags.find(tag => tag.id === tagId);
                  if (!tag) {
                    console.warn(`Tag with id ${tagId} not found in available tags`);
                  }
                  return tag;
                }).filter(Boolean);
                
                // Replace backend tags with local tags to avoid conflicts
                transformed.tags = localTags;
                
                console.log(`Item ${item.id} (${item.name}) now has tags:`, transformed.tags.map(t => t.name));
              }
              
              return transformed;
            });
            
            set({ items: transformedItems });
            
            // Apply current filters
            get().applyFilters();
            
            // Force sync favorites if they are already loaded
            const { favoriteItems } = get();
            if (favoriteItems.length > 0) {
              get().syncFavoritesWithItems();
            }
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
            
            // Get available rooms and places for defaults
            const { rooms, places } = get();
            
            // Ensure we have data loaded
            if (rooms.length === 0 || places.length === 0) {
              await get().loadInventoryData();
              const { rooms: updatedRooms, places: updatedPlaces } = get();
              
              if (updatedRooms.length === 0 || updatedPlaces.length === 0) {
                throw new Error('No rooms or places available. Please set up your inventory structure first.');
              }
            }
            
            // Use default room and place if not provided
            const defaultRoomId = itemData.roomId || rooms[0]?.id || 1;
            const defaultPlaceId = itemData.placeId || places[0]?.id || 1;
            
            const createData = {
              name: itemData.name,
              quantity: itemData.quantity,
              status: itemData.status,
              roomId: defaultRoomId,
              placeId: defaultPlaceId,
              consumable: itemData.consumable || false, // Always include consumable field as boolean
              ...(itemData.containerId && { containerId: itemData.containerId }),
              ...(itemData.price && { price: itemData.price }),
              ...(itemData.itemLink && { itemLink: itemData.itemLink }),
              // Note: sellprice and image are not supported by the backend yet
              // ...(itemData.sellprice && { sellprice: itemData.sellprice }),
              // ...(itemData.image && { image: itemData.image }),
            };
            
            console.log('Creating item with data:', createData);
            const createdItem = await backendApi.createItem(createData);
            console.log('Item created successfully:', createdItem);
            
            // Store tags locally (temporary until backend supports it)
            if (itemData.tagIds && itemData.tagIds.length > 0) {
              console.log('Storing tags locally for item:', createdItem.id, itemData.tagIds);
              const currentState = get();
              console.log('Current itemTagAssociations:', currentState.itemTagAssociations);
              console.log('Available tags:', currentState.tags.map(t => ({ id: t.id, name: t.name })));
              
              // Update tags locally first
              set((state) => ({
                itemTagAssociations: {
                  ...state.itemTagAssociations,
                  [createdItem.id]: itemData.tagIds
                }
              }));
              
              // Also try to update item tags on backend if supported
              try {
                await backendApi.updateItemTags(createdItem.id, itemData.tagIds);
                console.log('Successfully added tags to item on backend');
              } catch (tagError) {
                console.warn('Failed to add tags to item on backend (may not be supported yet):', tagError);
                // Tags are stored locally, so operation continues
              }
            }
            
            // Reload items to include the new item with tags
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
            
            // Extract tags and fields not supported by backend from updates
            const { tagIds, consumable, sellprice, image, ...itemUpdates } = updates;
            
            console.log('Updating item:', itemId, 'with updates:', updates);
            
            // Update tags locally first for immediate UI update
            if (tagIds !== undefined) {
              console.log('Updating item tags locally:', tagIds);
              
              const { tags } = get();
              set((state) => ({
                itemTagAssociations: {
                  ...state.itemTagAssociations,
                  [itemId]: tagIds
                }
              }));
              
              // Update the item in local state immediately with new tags
              const localTags = tagIds.map(tagId => tags.find(tag => tag.id === tagId)).filter(Boolean);
              get().updateItemLocal(itemId, { tags: localTags });
            }
            
            // Update ALL properties locally first for immediate UI response (including consumable)
            const allLocalUpdates = { ...updates };
            delete allLocalUpdates.tagIds; // Remove tagIds as it's handled separately
            
            if (Object.keys(allLocalUpdates).length > 0) {
              console.log('Updating item properties locally:', allLocalUpdates);
              get().updateItemLocal(itemId, allLocalUpdates);
            }
            
            // Update only backend-supported properties on backend
            if (Object.keys(itemUpdates).length > 0) {
              console.log('Updating item properties on backend:', itemUpdates);
              await backendApi.updateItem(itemId, itemUpdates);
            }
            
            // Try to update tags on backend if supported
            if (tagIds !== undefined) {
              try {
                await backendApi.updateItemTags(itemId, tagIds);
                console.log('Successfully updated tags on backend');
              } catch (tagError) {
                console.warn('Failed to update item tags on backend (may not be supported yet):', tagError);
                // Tags are stored locally, so operation continues
              }
            }
            
            console.log('Item update completed successfully');
          } catch (err: any) {
            console.error('Error updating item:', err);
            set({ error: err.message || 'Failed to update item' });
            // Reload items to restore correct state
            await get().loadItems();
            throw err;
          } finally {
            set({ loading: false });
          }
        },

        updateItemLocal: (itemId: number, updates: Partial<ItemWithLocation>) => {
          const { items } = get();
          const updatedItems = items.map(item => 
            item.id === itemId 
              ? { ...item, ...updates }
              : item
          );
          set({ items: updatedItems });
          get().applyFilters();
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
            
            // Sync favorites with main items list if items are already loaded
            const { items: mainItems } = get();
            if (mainItems.length > 0) {
              get().syncFavoritesWithItems();
            }
          } catch (err: any) {
            console.error('Error loading favorites:', err);
            set({ favoritesError: err.message || 'Failed to load favorites' });
          } finally {
            set({ favoritesLoading: false });
          }
        },

        toggleFavorite: async (itemId: number) => {
          try {
            // Don't set loading to true to avoid triggering skeleton loader
            set({ error: null });
            
            const { items, favoriteItems, filteredItems } = get();
            const item = items.find(item => item.id === itemId);
            if (!item) return;

            console.log('Toggling favorite for item:', itemId, 'Current state:', item.isFavorite);

            // Update local state immediately for instant UI feedback
            const newFavoriteState = !item.isFavorite;
            const updatedItems = items.map(i => 
              i.id === itemId ? { ...i, isFavorite: newFavoriteState } : i
            );
            
            // Update favorite items list
            let updatedFavoriteItems;
            if (newFavoriteState) {
              // Add to favorites
              const updatedItem = updatedItems.find(i => i.id === itemId);
              if (updatedItem) {
                updatedFavoriteItems = [...favoriteItems, updatedItem];
              }
            } else {
              // Remove from favorites
              updatedFavoriteItems = favoriteItems.filter(i => i.id !== itemId);
            }

            // Update filtered items directly to maintain scroll position
            const updatedFilteredItems = filteredItems.map(i => 
              i.id === itemId ? { ...i, isFavorite: newFavoriteState } : i
            );

            // Update all states in one go
            set({ 
              items: updatedItems,
              favoriteItems: updatedFavoriteItems || favoriteItems,
              filteredItems: updatedFilteredItems
            });

            // Make API call in background
            if (item.isFavorite) {
              await backendApi.removeFromFavorites(itemId);
            } else {
              await backendApi.addToFavorites(itemId);
            }
            
            console.log('Favorite toggled successfully for item:', itemId, 'New state:', newFavoriteState);
          } catch (err: any) {
            console.error('Error toggling favorite:', err);
            set({ error: err.message || 'Failed to toggle favorite' });
            
            // Revert local state on error
            const { items, favoriteItems, filteredItems } = get();
            const item = items.find(item => item.id === itemId);
            if (item) {
              const revertedItems = items.map(i => 
                i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i
              );
              
              // Revert favorite items list
              let revertedFavoriteItems;
              if (item.isFavorite) {
                // Item was added to favorites but failed, remove it
                revertedFavoriteItems = favoriteItems.filter(i => i.id !== itemId);
              } else {
                // Item was removed from favorites but failed, add it back
                const originalItem = revertedItems.find(i => i.id === itemId);
                if (originalItem) {
                  revertedFavoriteItems = [...favoriteItems, originalItem];
                }
              }

              // Revert filtered items as well
              const revertedFilteredItems = filteredItems.map(i => 
                i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i
              );
              
              set({ 
                items: revertedItems,
                favoriteItems: revertedFavoriteItems || favoriteItems,
                filteredItems: revertedFilteredItems
              });
            }
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

        syncFavoritesWithItems: () => {
          const { items, favoriteItems } = get();
          const favoriteItemIds = favoriteItems.map(fav => fav.id);
          
          console.log('Syncing favorites with items...', { 
            totalItems: items.length, 
            favoriteItemIds: favoriteItemIds 
          });
          
          // Update items with correct favorite status based on loaded favorites
          const syncedItems = items.map(item => ({
            ...item,
            isFavorite: favoriteItemIds.includes(item.id)
          }));
          
          set({ items: syncedItems });
          get().applyFilters();
          
          console.log('Favorites synced with items successfully');
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
            
            // Update items with latest alert information
            const { items } = get();
            const updatedItems = items.map(item => {
              const itemAlerts = alerts.filter(alert => alert.itemId === item.id);
              const activeAlerts = itemAlerts.filter(alert => alert.isActive);
              return {
                ...item,
                alerts: itemAlerts,
                activeAlerts: activeAlerts
              };
            });
            set({ items: updatedItems });
            
            // Update triggered alerts with the updated items
            const triggered = sortAlertsByPriority(getTriggeredAlerts(updatedItems));
            set({ triggeredAlerts: triggered });
            
            // Apply current filters to update filteredItems
            get().applyFilters();
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
            // Filter out isActive for creation as the API doesn't expect it
            const { isActive, ...createData } = alertData;
            await backendApi.createAlert(createData);
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
            
            // Load items first to get the base data
            await get().loadItems();
            
            // Then load related data including favorites and alerts
            await Promise.all([
              get().loadFavorites(),
              get().loadInventoryData(),
              get().loadAlerts(),
            ]);
            
            // After loading favorites, sync the favorite status with items
            const { items, favoriteItems } = get();
            const favoriteItemIds = favoriteItems.map(fav => fav.id);
            
            console.log('InventoryStore: Syncing favorites...', { 
              totalItems: items.length, 
              favoriteItemIds: favoriteItemIds 
            });
            
            // Update items with correct favorite status based on loaded favorites
            const syncedItems = items.map(item => ({
              ...item,
              isFavorite: favoriteItemIds.includes(item.id)
            }));
            
            set({ items: syncedItems });
            get().applyFilters();
            
            console.log('InventoryStore: Inventory initialized successfully with synced favorites');
          } catch (error) {
            console.error('InventoryStore: Error initializing inventory:', error);
          }
        },
      }),
      {
        name: 'inventory-storage',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist search/filter preferences and local tag associations
        partialize: (state) => ({
          selectedFilter: state.selectedFilter,
          advancedFilters: state.advancedFilters,
          itemTagAssociations: state.itemTagAssociations,
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
  const updateItemLocal = useInventoryStore((state) => state.updateItemLocal);
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
    updateItemLocal,
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
  const syncFavoritesWithItems = useInventoryStore((state) => state.syncFavoritesWithItems);
  const clearFavoritesError = useInventoryStore((state) => state.clearFavoritesError);
  
  return {
    favoriteItems,
    favoritesLoading,
    favoritesError,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    syncFavoritesWithItems,
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
