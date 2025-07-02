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

export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  itemCount?: number;
  totalImportanceScore?: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  endDate?: string;
}

export interface ProjectItem {
  id: number;
  projectId: number;
  itemId: number;
  importanceScore?: number;
  notes?: string;
  item: Item;
  createdAt: string;
  updatedAt?: string;
  detailedScore?: ItemWithDetailedScore;
}

export interface AddItemToProjectDto {
  itemId: number;
  quantity: number;
  isActive?: boolean;
}

export interface UpdateProjectItemDto {
  importanceScore?: number;
  notes?: string;
}

// Project scoring types
export interface ProjectScoringStatistics {
  totalProjects: number;
  activeProjects: number;
  totalItems: number;
  averageImportanceScore: number;
  highPriorityItems: number;
}

export interface ItemWithScore {
  id: number;
  name: string;
  importanceScore: number;
  projectId: number;
  projectName: string;
}

export interface ProjectUsage {
  projectId: number;
  projectName: string;
  status: string;
  priority: string;
  quantityUsed: number;
  contribution: number;
}

export interface ItemScoreBreakdown {
  activeProjectsScore: number;
  pausedProjectsScore: number;
  projectCountBonus: number;
  priorityMultiplier: number;
}

export interface ItemWithDetailedScore {
  itemId: number;
  itemName: string;
  totalScore: number;
  breakdown: ItemScoreBreakdown;
  projectsUsage: ProjectUsage[];
  quantityUsedInProject: number;
  isActiveInProject: boolean;
}

export interface ProjectScoringBreakdown {
  projectId: number;
  projectName: string;
  projectStatus: string;
  projectPriority: string;
  itemsScores: ItemWithDetailedScore[];
}
