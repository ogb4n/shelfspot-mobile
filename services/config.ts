import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_BACKEND_URL = 'http://192.168.1.100:3001';
const STORAGE_KEY = 'backend_server_ip';

export class ConfigService {
  private static instance: ConfigService;
  private _backendUrl: string = DEFAULT_BACKEND_URL;
  private _isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    try {
      const storedIp = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedIp) {
        this._backendUrl = storedIp;
        console.log('ConfigService: Loaded server IP from storage:', storedIp);
      } else {
        console.log('ConfigService: Using default server IP');
      }
    } catch (error) {
      console.error('ConfigService: Error loading server IP:', error);
    }

    this._isInitialized = true;
  }

  get backendUrl(): string {
    return this._backendUrl;
  }

  async setServerIp(ip: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, ip);
      this._backendUrl = ip;
      console.log('ConfigService: Server IP updated to:', ip);
    } catch (error) {
      console.error('ConfigService: Error saving server IP:', error);
      throw error;
    }
  }

  async getServerIp(): Promise<string> {
    try {
      const storedIp = await AsyncStorage.getItem(STORAGE_KEY);
      return storedIp || '192.168.1.100'; // Default IP
    } catch (error) {
      console.error('ConfigService: Error getting server IP:', error);
      return '192.168.1.100';
    }
  }

  async clearServerConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      this._backendUrl = DEFAULT_BACKEND_URL;
      console.log('ConfigService: Server config cleared');
    } catch (error) {
      console.error('ConfigService: Error clearing server config:', error);
    }
  }

  // Test if server is reachable
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout     
      
      console.log('ConfigService: Testing connection to backend at', this._backendUrl);

      const response = await fetch(`${this._backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ConfigService: Connection test successful:', data);
        return true;
      } else {
        console.log('ConfigService: Connection test failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('ConfigService: Connection test failed:', error);
      return false;
    }
  }

  // Advanced test that returns server information
  async testConnectionDetailed(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      console.log('ConfigService: Testing connection to backend at', this._backendUrl);

      const response = await fetch(`${this._backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        // Transform health data to match expected ServerInfo format
        const serverInfo = {
          version: data.version || '1.0.0',
          timestamp: data.timestamp,
          message: data.service || 'ShelfSpot API'
        };
        return { success: true, data: serverInfo };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.name === 'AbortError' ? 'Connection timeout' : error.message || 'Network error'
      };
    }
  }
}

export const configService = ConfigService.getInstance();
