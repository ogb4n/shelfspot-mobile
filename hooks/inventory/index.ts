// Barrel export for inventory hooks
// All hooks now use the new Zustand store architecture

// Re-export the Zustand store-based hooks
export {
    useInventoryAlerts, useInventoryData, useInventoryFavorites, useInventoryFilters, useInventoryItems, useInventorySelection, useInventoryStore
} from '@/stores/inventory';

