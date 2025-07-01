import AsyncStorage from "@react-native-async-storage/async-storage";
import { configService } from "./config";

import { CreateItemDto, ItemResponseDto, UpdateItemDto } from "@/types/api";

export class BackendApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "BackendApiError";
  }
}

export interface User {
  id: string;
  email: string;
  name?: string;
  admin?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface ServerTestResponse {
  message: string;
  timestamp: string;
  version: string;
}

class BackendApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      console.log("BackendAPI: Using token:", token.substring(0, 50) + "...");
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("BackendAPI: No token found");
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await configService.initialize(); // Ensure config is initialized
    const url = `${configService.backendUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    console.log(`BackendAPI: Making request to ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log(`BackendAPI: Response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, keep the default message
      }
      console.log(`BackendAPI: Error: ${errorMessage}`);
      throw new BackendApiError(response.status, errorMessage);
    }

    // Handle empty responses (like DELETE operations)
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || response.status === 204) {
      return {} as T;
    }

    try {
      return response.json();
    } catch {
      // If JSON parsing fails, return empty object for successful responses
      console.log(
        "BackendAPI: Empty or invalid JSON response, returning empty object"
      );
      return {} as T;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log("BackendAPI: Login attempt for email:", email);
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    console.log("BackendAPI: Register attempt for email:", email);
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getProfile(): Promise<User> {
    console.log("BackendAPI: Getting user profile");
    return this.request<User>("/auth/profile");
  }

  async updateProfile(name: string): Promise<User> {
    console.log("BackendAPI: Updating user profile");
    return this.request<User>("/auth/profile/name", {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  async updateEmail(email: string): Promise<User> {
    console.log('BackendAPI: Updating user email');
    return this.request<User>('/auth/profile/email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    console.log('BackendAPI: Resetting password for email:', email);
    return this.request<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  }

  async updateNotificationToken(notificationToken: string): Promise<User> {
    return this.request<User>('/auth/profile/notification-token', {
      method: 'PUT',
      body: JSON.stringify({ notificationToken }),
    });
  }

  // Items methods
  async getItems(search?: string): Promise<any[]> {
    if (search) {
      return this.request<any[]>(
        `/items/search?q=${encodeURIComponent(search)}`
      );
    }
    return this.request<any[]>("/items");
  }

  async getItem(id: number): Promise<any> {
    return this.request<any>(`/items/${id}`);
  }

  async createItem(data: CreateItemDto): Promise<ItemResponseDto> {
    return this.request<ItemResponseDto>("/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: number, data: UpdateItemDto): Promise<ItemResponseDto> {
    return this.request<ItemResponseDto>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/items/${id}`, {
      method: "DELETE",
    });
  }

  async deleteItems(ids: number[]): Promise<{ message: string }> {
    const deletePromises = ids.map((id) => this.deleteItem(id));
    await Promise.all(deletePromises);
    return { message: `${ids.length} items deleted successfully` };
  }

  // Alerts methods
  async getAlerts(): Promise<any[]> {
    return this.request<any[]>("/alerts");
  }

  async createAlert(data: {
    itemId: number;
    threshold: number;
    name?: string;
  }): Promise<any> {
    return this.request<any>("/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAlert(
    id: number,
    data: { threshold?: number; name?: string; isActive?: boolean }
  ): Promise<any> {
    return this.request<any>(`/alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: number): Promise<{ message?: string }> {
    return this.request<{ message?: string }>(`/alerts/${id}`, {
      method: "DELETE",
    });
  }

  async checkAlerts(): Promise<any[]> {
    return this.request<any[]>("/alerts/check");
  }

  // Rooms, Places, Containers methods
  async getRooms(): Promise<any[]> {
    return this.request<any[]>("/rooms");
  }

  async getRoom(id: number): Promise<any> {
    return this.request<any>(`/rooms/${id}`);
  }

  async createRoom(data: { name: string; icon?: string }): Promise<any> {
    return this.request<any>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPlaces(): Promise<any[]> {
    return this.request<any[]>("/places");
  }

  async getPlace(id: number): Promise<any> {
    return this.request<any>(`/places/${id}`);
  }

  async createPlace(data: {
    name: string;
    roomId: number;
    icon?: string;
  }): Promise<any> {
    return this.request<any>("/places", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getContainers(): Promise<any[]> {
    return this.request<any[]>("/containers");
  }

  async getContainer(id: number): Promise<any> {
    return this.request<any>(`/containers/${id}`);
  }

  async createContainer(data: {
    name: string;
    placeId: number;
    roomId?: number;
    icon?: string;
  }): Promise<any> {
    return this.request<any>("/containers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTags(): Promise<any[]> {
    return this.request<any[]>("/tags");
  }

  // CRUD methods for Rooms
  async updateRoom(
    id: number,
    data: { name?: string; description?: string }
  ): Promise<any> {
    return this.request<any>(`/rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/rooms/${id}`, {
      method: "DELETE",
    });
  }

  // CRUD methods for Places
  async updatePlace(id: number, data: { name?: string }): Promise<any> {
    return this.request<any>(`/places/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deletePlace(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/places/${id}`, {
      method: "DELETE",
    });
  }

  // CRUD methods for Containers
  async updateContainer(
    id: number,
    data: {
      name?: string;
      icon?: string;
      placeId?: number;
      roomId?: number;
    }
  ): Promise<any> {
    return this.request<any>(`/containers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteContainer(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/containers/${id}`, {
      method: "DELETE",
    });
  }

  // CRUD methods for Tags
  async createTag(data: { name: string }): Promise<any> {
    return this.request<any>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: number, data: { name?: string }): Promise<any> {
    return this.request<any>(`/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tags/${id}`, {
      method: "DELETE",
    });
  }

  // Item-Tag management methods
  async addTagToItem(itemId: number, tagId: number): Promise<any> {
    return this.request<any>(`/items/${itemId}/tags/${tagId}`, {
      method: 'POST',
    });
  }

  async removeTagFromItem(itemId: number, tagId: number): Promise<any> {
    return this.request<any>(`/items/${itemId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  async getItemTags(itemId: number): Promise<any[]> {
    return this.request<any[]>(`/items/${itemId}/tags`);
  }

  async updateItemTags(itemId: number, tagIds: number[]): Promise<any> {
    return this.request<any>(`/items/${itemId}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tagIds }),
    });
  }

  // Favorites methods
  async getFavorites(userId?: number): Promise<any[]> {
    const params = userId ? `?userId=${userId}` : "";
    return this.request<any[]>(`/favourites${params}`);
  }

  async addToFavorites(itemId: number): Promise<any> {
    return this.request<any>(`/favourites/item/${itemId}`, {
      method: "POST",
    });
  }

  async removeFromFavorites(itemId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/favourites/item/${itemId}`, {
      method: "DELETE",
    });
  }

  async removeFavoriteById(favoriteId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/favourites/${favoriteId}`, {
      method: "DELETE",
    });
  }

  // Projects methods
  async getProjects(): Promise<any[]> {
    return this.request<any[]>("/projects");
  }

  async getProject(id: number): Promise<any> {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(data: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    return this.request<any>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    id: number,
    data: {
      name?: string;
      description?: string;
      status?: string;
      priority?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<any> {
    return this.request<any>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: "DELETE",
    });
  }

  // Project items methods
  async getProjectItems(projectId: number): Promise<any[]> {
    const project = await this.request<any>(`/projects/${projectId}`);
    return project.projectItems || [];
  }

  async addItemToProject(
    projectId: number,
    data: {
      itemId: number;
      quantity: number;
      isActive?: boolean;
    }
  ): Promise<any> {
    return this.request<any>(`/projects/${projectId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProjectItem(
    projectId: number,
    itemId: number,
    data: {
      importanceScore?: number;
      notes?: string;
    }
  ): Promise<any> {
    return this.request<any>(`/projects/${projectId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async removeItemFromProject(
    projectId: number,
    itemId: number
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/projects/${projectId}/items/${itemId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getProjectStatistics(projectId: number): Promise<any> {
    return this.request<any>(`/projects/${projectId}/statistics`);
  }

  async getProjectScoringBreakdown(projectId: number): Promise<any> {
    return this.request<any>(`/projects/${projectId}/scoring/breakdown`);
  }

  // Public request method for custom endpoints
  async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  // Test connection with more detailed information
  async testConnection(): Promise<ServerTestResponse> {
    console.log("BackendAPI: Testing server connection");
    return this.request<ServerTestResponse>("/auth/test");
  }

  // Compatibility method for config service
  async testConnectionSimple(): Promise<boolean> {
    try {
      await this.testConnection();
      return true;
    } catch (error) {
      console.log("BackendAPI: Simple connection test failed:", error);
      return false;
    }
  }
}

export const backendApi = new BackendApiService();
