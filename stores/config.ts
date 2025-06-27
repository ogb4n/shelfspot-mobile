import { configService } from '@/services/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export interface ServerInfo {
  version: string;
  timestamp: string;
  message: string;
}

export interface ConfigState {
  // State
  serverIp: string;
  connectionStatus: ConnectionStatus;
  serverInfo: ServerInfo | null;
  error: string | null;
  isLoading: boolean;
  
  // Actions
  setServerIp: (ip: string) => Promise<void>;
  testConnection: () => Promise<boolean>;
  testConnectionDetailed: () => Promise<{ success: boolean; data?: ServerInfo; error?: string }>;
  clearConfig: () => Promise<void>;
  getServerIp: () => Promise<string>;
  clearError: () => void;
  
  // Internal actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setServerInfo: (info: ServerInfo | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      serverIp: '192.168.1.100',
      connectionStatus: 'idle',
      serverInfo: null,
      error: null,
      isLoading: false,

      // Actions
      setServerIp: async (ip: string) => {
        try {
          console.log('ConfigStore: Setting server IP to:', ip);
          await configService.setServerIp(ip);
          set({ 
            serverIp: ip,
            connectionStatus: 'idle',
            serverInfo: null,
            error: null 
          });
          console.log('ConfigStore: Server IP updated successfully');
        } catch (error: any) {
          console.error('ConfigStore: Error setting server IP:', error);
          set({ error: 'Erreur lors de la sauvegarde de l\'adresse IP' });
          throw error;
        }
      },

      testConnection: async () => {
        try {
          set({ 
            isLoading: true, 
            connectionStatus: 'testing',
            error: null,
            serverInfo: null 
          });

          console.log('ConfigStore: Testing connection to server with IP:', get().serverIp);
          const success = await configService.testConnection();
          
          set({ 
            connectionStatus: success ? 'success' : 'error',
            isLoading: false,
            error: success ? null : 'Impossible de se connecter au serveur'
          });
          
          console.log('ConfigStore: Connection test result:', success);
          return success;
        } catch (error: any) {
          console.error('ConfigStore: Connection test failed:', error);
          set({ 
            connectionStatus: 'error',
            isLoading: false,
            error: error.message || 'Erreur lors du test de connexion'
          });
          return false;
        }
      },

      testConnectionDetailed: async () => {
        try {
          set({ 
            isLoading: true, 
            connectionStatus: 'testing',
            error: null,
            serverInfo: null 
          });
          
          console.log('ConfigStore: Testing detailed connection to server');
          const result = await configService.testConnectionDetailed();
          
          if (result.success && result.data) {
            set({ 
              connectionStatus: 'success',
              serverInfo: result.data,
              isLoading: false,
              error: null
            });
          } else {
            set({ 
              connectionStatus: 'error',
              isLoading: false,
              error: result.error || 'Connexion échouée'
            });
          }
          
          console.log('ConfigStore: Detailed connection test result:', result);
          return result;
        } catch (error: any) {
          console.error('ConfigStore: Detailed connection test failed:', error);
          const errorMessage = error.message || 'Erreur lors du test de connexion';
          set({ 
            connectionStatus: 'error',
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      clearConfig: async () => {
        try {
          console.log('ConfigStore: Clearing server configuration');
          await configService.clearServerConfig();
          set({ 
            serverIp: '192.168.1.100',
            connectionStatus: 'idle',
            serverInfo: null,
            error: null 
          });
          console.log('ConfigStore: Server configuration cleared');
        } catch (error: any) {
          console.error('ConfigStore: Error clearing config:', error);
          set({ error: 'Erreur lors de la suppression de la configuration' });
          throw error;
        }
      },

      getServerIp: async () => {
        try {
          const ip = await configService.getServerIp();
          set({ serverIp: ip });
          return ip;
        } catch (error: any) {
          console.error('ConfigStore: Error getting server IP:', error);
          return get().serverIp; // Return current state as fallback
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Internal actions
      setConnectionStatus: (status: ConnectionStatus) => {
        set({ connectionStatus: status });
      },

      setServerInfo: (info: ServerInfo | null) => {
        set({ serverInfo: info });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all config state
      partialize: (state) => ({ 
        serverIp: state.serverIp,
        serverInfo: state.serverInfo
      }),
    }
  )
);

// Helper hook to initialize config on app start
export const useConfigInitializer = () => {
  const { getServerIp } = useConfigStore();

  const initialize = async () => {
    try {
      console.log('ConfigStore: Initializing configuration');
      await configService.initialize();
      await getServerIp();
      console.log('ConfigStore: Configuration initialized');
    } catch (error) {
      console.error('ConfigStore: Error initializing config:', error);
    }
  };

  return { initialize };
};
