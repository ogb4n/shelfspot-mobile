import { useEffect, useState } from 'react';
import { backendApi } from '../../services/backend-api';

interface UseInventoryDataReturn {
  rooms: any[];
  places: any[];
  containers: any[];
  tags: any[];
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
}

export const useInventoryData = (): UseInventoryDataReturn => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roomsData, placesData, containersData, tagsData] = await Promise.all([
        backendApi.getRooms(),
        backendApi.getPlaces(),
        backendApi.getContainers(),
        backendApi.getTags(),
      ]);

      setRooms(roomsData);
      setPlaces(placesData);
      setContainers(containersData);
      setTags(tagsData);
    } catch (err: any) {
      console.error('Error loading inventory data:', err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return {
    rooms,
    places,
    containers,
    tags,
    loading,
    error,
    loadAll,
  };
};
