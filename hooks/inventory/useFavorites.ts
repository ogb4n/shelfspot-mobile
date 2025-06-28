import { useEffect, useState } from 'react';
import { backendApi } from '../../services/backend-api';
import { useAuthStore } from '../../stores/auth';
import { ItemWithLocation } from '../../types/inventory';
import { transformItemsToItemsWithLocation } from '../../utils/inventory/transforms';

export const useFavorites = () => {
  const { user } = useAuthStore();
  const [favoriteItems, setFavoriteItems] = useState<ItemWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from API
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const favoritesData = await backendApi.getFavorites();
      
      // Extract items from favorites and transform them
      const items = favoritesData.map((favorite: any) => favorite.item);
      const transformedItems = transformItemsToItemsWithLocation(items, user?.id);
      
      // Mark all as favorites since they come from favorites endpoint
      const favoriteItemsWithFlag = transformedItems.map(item => ({
        ...item,
        isFavorite: true
      }));
      
      setFavoriteItems(favoriteItemsWithFlag);
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from favorites
  const removeFromFavorites = async (itemId: number) => {
    try {
      await backendApi.removeFromFavorites(itemId);
      
      // Remove from local state immediately for better UX
      setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err: any) {
      console.error('Error removing from favorites:', err);
      setError(err.message || 'Failed to remove from favorites');
      // Reload favorites to restore state if removal failed
      await loadFavorites();
    }
  };

  // Add item to favorites
  const addToFavorites = async (itemId: number) => {
    try {
      await backendApi.addToFavorites(itemId);
      
      // Reload favorites to get the updated list
      await loadFavorites();
    } catch (err: any) {
      console.error('Error adding to favorites:', err);
      setError(err.message || 'Failed to add to favorites');
    }
  };

  // Load favorites on component mount
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  return {
    favoriteItems,
    loading,
    error,
    loadFavorites,
    removeFromFavorites,
    addToFavorites,
  };
};
