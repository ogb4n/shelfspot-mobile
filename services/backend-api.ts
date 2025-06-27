import AsyncStorage from '@react-native-async-storage/async-storage';
import { configService } from './config';

export class BackendApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'BackendApiError';
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
      'Content-Type': 'application/json',
    };

    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      console.log('BackendAPI: Using token:', token.substring(0, 50) + '...');
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('BackendAPI: No token found');
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

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('BackendAPI: Login attempt for email:', email);
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    console.log('BackendAPI: Register attempt for email:', email);
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getProfile(): Promise<User> {
    console.log('BackendAPI: Getting user profile');
    return this.request<User>('/auth/profile');
  }

  async updateProfile(name: string): Promise<User> {
    console.log('BackendAPI: Updating user profile');
    return this.request<User>('/auth/profile/name', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    console.log('BackendAPI: Resetting password for email:', email);
    return this.request<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  }

  // Items methods (for future use)
  async getItems(search?: string): Promise<any[]> {
    const searchParam = search ? `?q=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/items/search${searchParam}`);
  }

  async getItem(id: number): Promise<any> {
    return this.request<any>(`/items/${id}`);
  }

  async createItem(data: any): Promise<any> {
    return this.request<any>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: number, data: any): Promise<any> {
    return this.request<any>(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Test connection with more detailed information
  async testConnection(): Promise<ServerTestResponse> {
    console.log('BackendAPI: Testing server connection');
    return this.request<ServerTestResponse>('/auth/test');
  }

  // Compatibility method for config service
  async testConnectionSimple(): Promise<boolean> {
    try {
      await this.testConnection();
      return true;
    } catch (error) {
      console.log('BackendAPI: Simple connection test failed:', error);
      return false;
    }
  }
}

export const backendApi = new BackendApiService();
