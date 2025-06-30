// API types for backend communication

export interface CreateItemDto {
  name: string;
  quantity: number;
  status?: string;
  roomId: number;
  placeId: number;
  containerId?: number;
  consumable?: boolean;
  price?: number;
  itemLink?: string;
  // Note: sellprice and image are not supported by the backend CreateItemDto schema
  // sellprice?: number;
  // image?: string;
}

export interface ItemResponseDto {
  id: number;
  name: string;
  quantity: number;
  status?: string;
  consumable: boolean;
  price?: number;
  sellprice?: number;
  placeId?: number;
  roomId?: number;
  containerId?: number;
  itemLink?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: number;
    name: string;
    icon?: string;
  };
  place?: {
    id: number;
    name: string;
    icon?: string;
    roomId: number;
  };
  container?: {
    id: number;
    name: string;
    icon?: string;
    placeId: number;
  };
}

export type UpdateItemDto = Partial<CreateItemDto>;
