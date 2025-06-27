import { FilterChip, ItemStatus } from '../types/inventory';

export const ITEM_STATUSES: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Disponible', color: '#10B981' },
  { value: 'running_low', label: 'Stock faible', color: '#F59E0B' },
  { value: 'out_of_stock', label: 'Épuisé', color: '#EF4444' },
  { value: 'expired', label: 'Expiré', color: '#8B5CF6' },
];

export const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'Tous', icon: 'square.grid.2x2' },
  { key: 'available', label: 'Disponible', icon: 'checkmark.circle' },
  { key: 'running_low', label: 'Stock faible', icon: 'exclamationmark.triangle' },
  { key: 'out_of_stock', label: 'Épuisé', icon: 'xmark.circle' },
  { key: 'favorites', label: 'Favoris', icon: 'heart' },
];

export const ADD_ITEM_STEPS = [
  { title: 'Informations de base', description: 'Nom, quantité, statut et type' },
  { title: 'Image et code-barres', description: 'Photo et scan optionnels' },
  { title: 'Localisation', description: 'Pièce, endroit et contenant' },
  { title: 'Détails complémentaires', description: 'Tags, liens et prix' },
  { title: 'Confirmation', description: 'Vérifiez les informations' },
];

export const DEBOUNCE_DELAY = 300; // ms

export const DEFAULT_ALERT_THRESHOLD = 5;

export const MAX_TAG_LENGTH = 20;
export const MAX_ITEM_NAME_LENGTH = 100;
