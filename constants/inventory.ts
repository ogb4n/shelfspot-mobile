import { FilterChip, ItemStatus } from '../types/inventory';

export const ITEM_STATUSES: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: '#10B981' },
  { value: 'running_low', label: 'Running Low', color: '#F59E0B' },
  { value: 'out_of_stock', label: 'Out of Stock', color: '#EF4444' },
  { value: 'expired', label: 'Expired', color: '#8B5CF6' },
];

export const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'All', icon: 'square.grid.2x2' },
  { key: 'available', label: 'Available', icon: 'checkmark.circle' },
  { key: 'running_low', label: 'Running Low', icon: 'exclamationmark.triangle' },
  { key: 'out_of_stock', label: 'Out of Stock', icon: 'xmark.circle' },
  { key: 'consumables', label: 'Consumables', icon: 'cube.box.fill' },
  { key: 'favorites', label: 'Favorites', icon: 'heart' },
];

export const ADD_ITEM_STEPS = [
  { title: 'Basic Information', description: 'Name, quantity, status and type' },
  { title: 'Location', description: 'Room, place and container' },
  { title: 'Additional Details', description: 'Tags, links and price' },
  { title: 'Confirmation', description: 'Review the information' },
];

export const DEBOUNCE_DELAY = 300; // ms

export const DEFAULT_ALERT_THRESHOLD = 5;

export const MAX_TAG_LENGTH = 20;
export const MAX_ITEM_NAME_LENGTH = 100;
