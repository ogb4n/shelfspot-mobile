import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AppState {
  // Application state
  isInitialized: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark' | 'auto';
  
  // Navigation state
  currentRoute: string;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setOnline: (online: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setCurrentRoute: (route: string) => void;
  
  // App lifecycle
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isInitialized: false,
    isOnline: true,
    theme: 'auto',
    currentRoute: '/',

    // Actions
    setInitialized: (initialized: boolean) => {
      set({ isInitialized: initialized });
    },

    setOnline: (online: boolean) => {
      set({ isOnline: online });
    },

    setTheme: (theme: 'light' | 'dark' | 'auto') => {
      set({ theme });
    },

    setCurrentRoute: (route: string) => {
      set({ currentRoute: route });
    },

    // App lifecycle
    initialize: async () => {
      try {
        console.log('AppStore: Initializing application');
        
        // Import the stores directly and use their methods
        const { useAuthStore } = await import('./auth');
        const { useConfigStore } = await import('./config');
        const { configService } = await import('@/services/config');
        
        // Initialize config service first
        await configService.initialize();
        
        // Load server IP
        const configStore = useConfigStore.getState();
        await configStore.getServerIp();
        
        // Check for auth token and refresh user if needed
        const authStore = useAuthStore.getState();
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const token = await AsyncStorage.getItem('access_token');
        
        if (token) {
          try {
            authStore.setLoading(true);
            console.log('AppStore: Token found, refreshing user profile');
            await authStore.refreshUser();
          } catch (error) {
            console.log('AppStore: Token invalid, user will remain logged out');
            // refreshUser already handles cleanup
          } finally {
            authStore.setLoading(false);
          }
        } else {
          console.log('AppStore: No token found');
          authStore.setLoading(false);
        }
        
        set({ isInitialized: true });
        console.log('AppStore: Application initialized successfully');
      } catch (error) {
        console.error('AppStore: Error initializing application:', error);
        set({ isInitialized: true }); // Set to true anyway to avoid infinite loading
      }
    },
  }))
);

// Helper hooks for common patterns
export const useAppInitialized = () => useAppStore((state) => state.isInitialized);
export const useAppOnline = () => useAppStore((state) => state.isOnline);
export const useAppTheme = () => useAppStore((state) => state.theme);
