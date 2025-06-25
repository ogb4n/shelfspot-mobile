export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  places: Place[];
}

export interface Place {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  containers: Container[];
}

export interface Container {
  id: string;
  placeId: string;
  name: string;
  description?: string;
  items: Item[];
}

export interface Item {
  id: string;
  containerId: string;
  name: string;
  description?: string;
  quantity: number;
  minQuantity?: number;
  image?: string;
  tags: string[];
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  isConsumable: boolean;
  isFavorite: boolean;
  barcode?: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  itemId: string;
  threshold: number;
  isActive: boolean;
  message: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface DashboardStats {
  totalItems: number;
  totalRooms: number;
  totalPlaces: number;
  totalContainers: number;
  itemsByRoom: { [roomId: string]: number };
  itemsByStatus: { [status: string]: number };
  lowStockItems: Item[];
  favoriteItems: Item[];
}
