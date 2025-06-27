import { Item, ItemWithLocation, Tag, Alert } from '../../types/inventory';

export const transformItemToItemWithLocation = (
  item: Item,
  currentUserId?: number
): ItemWithLocation => {
  // Build location string
  const locationParts: string[] = [];
  if (item.room?.name) locationParts.push(item.room.name);
  if (item.place?.name) locationParts.push(item.place.name);
  if (item.container?.name) locationParts.push(item.container.name);
  const location = locationParts.join(' → ') || 'Non localisé';

  // Extract tags from itemTags
  const tags: Tag[] = item.itemTags?.map(itemTag => itemTag.tag) || [];

  // Check if item is favorited by current user
  const isFavorite = currentUserId 
    ? item.favourites?.some(fav => fav.userId === currentUserId) || false
    : false;

  // Filter active alerts
  const activeAlerts: Alert[] = item.alerts?.filter(alert => alert.isActive) || [];

  return {
    ...item,
    location,
    tags,
    isFavorite,
    activeAlerts,
  };
};

export const transformItemsToItemsWithLocation = (
  items: Item[],
  currentUserId?: number
): ItemWithLocation[] => {
  return items.map(item => transformItemToItemWithLocation(item, currentUserId));
};

export const calculateTotalValue = (items: ItemWithLocation[]): number => {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    return total + (price * item.quantity);
  }, 0);
};

export const calculateTotalSellValue = (items: ItemWithLocation[]): number => {
  return items.reduce((total, item) => {
    const sellPrice = item.sellprice || item.price || 0;
    return total + (sellPrice * item.quantity);
  }, 0);
};

export const getItemStats = (items: ItemWithLocation[]) => {
  const total = items.length;
  const available = items.filter(item => item.status === 'available').length;
  const runningLow = items.filter(item => item.status === 'running_low').length;
  const outOfStock = items.filter(item => item.status === 'out_of_stock').length;
  const expired = items.filter(item => item.status === 'expired').length;
  const favorites = items.filter(item => item.isFavorite).length;
  const withAlerts = items.filter(item => item.activeAlerts.length > 0).length;
  
  const totalValue = calculateTotalValue(items);
  const totalSellValue = calculateTotalSellValue(items);

  return {
    total,
    available,
    runningLow,
    outOfStock,
    expired,
    favorites,
    withAlerts,
    totalValue,
    totalSellValue,
  };
};
