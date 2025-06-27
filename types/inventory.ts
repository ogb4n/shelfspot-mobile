// Types based on Prisma schema for inventory management

export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  admin: boolean;
  createdAt: Date;
  favourites?: Favourite[];
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  image?: string;
  price?: number;
  sellprice?: number;
  status?: ItemStatus;
  consumable: boolean;
  placeId?: number;
  roomId?: number;
  containerId?: number;
  itemLink?: string;
  createdAt?: Date;
  updatedAt?: Date;
  alerts?: Alert[];
  favourites?: Favourite[];
  container?: Container;
  place?: Place;
  room?: Room;
  itemTags?: ItemTag[];
}

export interface Place {
  id: number;
  name: string;
  icon?: string;
  roomId?: number;
  Container?: Container[];
  items?: Item[];
  room?: Room;
}

export interface Room {
  id: number;
  name: string;
  icon?: string;
  Container?: Container[];
  items?: Item[];
  places?: Place[];
}

export interface Tag {
  id: number;
  name: string;
  icon?: string;
  itemTags?: ItemTag[];
}

export interface ItemTag {
  id: number;
  itemId: number;
  tagId: number;
  item: Item;
  tag: Tag;
}

export interface Favourite {
  id: number;
  userId: number;
  itemId: number;
  item: Item;
  user: User;
}

export interface Container {
  id: number;
  name: string;
  icon?: string;
  roomId?: number;
  placeId?: number;
  place?: Place;
  room?: Room;
  items?: Item[];
}

export interface Alert {
  id: number;
  itemId: number;
  threshold: number;
  name?: string;
  isActive: boolean;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
  item: Item;
}

// Extended types for UI
export interface ItemWithLocation extends Item {
  location: string; // Computed field: "Room → Place → Container"
  tags: Tag[]; // Extracted from itemTags
  isFavorite: boolean; // Computed from favourites
  activeAlerts: Alert[]; // Filtered active alerts
}

export interface ItemFormData {
  name: string;
  quantity: number;
  status: ItemStatus;
  consumable: boolean;
  image?: string;
  price?: number;
  sellprice?: number;
  roomId?: number;
  placeId?: number;
  containerId?: number;
  itemLink?: string;
  tagIds: number[];
}

export interface FilterOptions {
  search: string;
  status?: ItemStatus;
  roomIds: number[];
  placeIds: number[];
  containerIds: number[];
  tagIds: number[];
  statuses: ItemStatus[];
  favoritesOnly: boolean;
}

export type ItemStatus = 'available' | 'running_low' | 'out_of_stock' | 'expired';

export type FilterKey = 'all' | 'available' | 'running_low' | 'out_of_stock' | 'favorites';

export interface FilterChip {
  key: FilterKey;
  label: string;
  icon: string;
}

export interface AlertFormData {
  itemId: number;
  threshold: number;
  name?: string;
  isActive: boolean;
}
