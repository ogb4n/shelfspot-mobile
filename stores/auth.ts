import { backendApi, BackendApiError, User } from '@/services/backend-api';
import { notificationService } from '@/services/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  
  // Notification management
  updateNotificationToken: (notificationToken: string) => Promise<void>;
  registerForNotifications: () => Promise<void>;
  
  // Internal actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Login attempt for email:', email);
          
          const response = await backendApi.login(email, password);
          
          // Store the token
          await AsyncStorage.setItem('access_token', response.access_token);
          
          set({ 
            user: response.user, 
            isAuthenticated: true,
            loading: false 
          });
          
          console.log('AuthStore: Login successful, user set:', response.user);
          
          // Register for notifications after successful login
          setTimeout(() => {
            get().registerForNotifications();
          }, 1000); // Small delay to let the UI settle
        } catch (error) {
          console.error('AuthStore: Login failed:', error);
          let errorMessage = 'Erreur de connexion';
          
          if (error instanceof BackendApiError) {
            if (error.status === 401) {
              errorMessage = 'Email ou mot de passe incorrect';
            } else if (error.status === 0 || error.message.includes('Network') || error.message.includes('fetch')) {
              errorMessage = 'Impossible de contacter le serveur. Vérifiez votre configuration réseau.';
            } else {
              errorMessage = error.message || 'Erreur de connexion';
            }
          } else if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = 'Serveur inaccessible. Vérifiez l\'adresse IP du serveur.';
          } else {
            errorMessage = 'Erreur de réseau ou serveur indisponible';
          }
          
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Register attempt for email:', email);
          
          const response = await backendApi.register(email, password, name);
          
          // Store the token
          await AsyncStorage.setItem('access_token', response.access_token);
          
          set({ 
            user: response.user, 
            isAuthenticated: true,
            loading: false 
          });
          
          console.log('AuthStore: Registration successful, user set:', response.user);
          
          // Register for notifications after successful registration
          setTimeout(() => {
            get().registerForNotifications();
          }, 1000); // Small delay to let the UI settle
        } catch (error) {
          console.error('AuthStore: Registration failed:', error);
          let errorMessage = 'Erreur d\'inscription';
          
          if (error instanceof BackendApiError) {
            if (error.status === 409) {
              errorMessage = 'Un compte avec cet email existe déjà';
            } else if (error.status === 0 || error.message.includes('Network') || error.message.includes('fetch')) {
              errorMessage = 'Impossible de contacter le serveur. Vérifiez votre configuration réseau.';
            } else {
              errorMessage = error.message || 'Erreur d\'inscription';
            }
          } else if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = 'Serveur inaccessible. Vérifiez l\'adresse IP du serveur.';
          } else {
            errorMessage = 'Erreur de réseau ou serveur indisponible';
          }
          
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          console.log('AuthStore: Logging out');
          await AsyncStorage.removeItem('access_token');
          set({ 
            user: null, 
            isAuthenticated: false,
            error: null 
          });
          console.log('AuthStore: Logout successful');
        } catch (error) {
          console.error('AuthStore: Logout error:', error);
        }
      },

      refreshUser: async () => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Refreshing user profile');
          
          const profile = await backendApi.getProfile();
          
          set({ 
            user: profile, 
            isAuthenticated: true,
            loading: false 
          });
          
          console.log('AuthStore: User profile refreshed');
        } catch (error) {
          console.error('AuthStore: User refresh failed:', error);
          // If error is due to invalid token, logout the user
          await AsyncStorage.removeItem('access_token');
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false,
            error: 'Session expirée'
          });
          throw error;
        }
      },

      updateProfile: async (name: string) => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Updating profile with name:', name);
          
          const updatedUser = await backendApi.updateProfile(name);
          
          set({ 
            user: updatedUser,
            loading: false 
          });
          
          console.log('AuthStore: Profile updated successfully');
        } catch (error) {
          console.error('AuthStore: Profile update failed:', error);
          set({ 
            error: 'Erreur lors de la mise à jour du profil',
            loading: false 
          });
          throw error;
        }
      },

      updateEmail: async (email: string) => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Updating email to:', email);
          
          const updatedUser = await backendApi.updateEmail(email);
          
          set({ 
            user: updatedUser,
            loading: false 
          });
          
          console.log('AuthStore: Email updated successfully');
        } catch (error) {
          console.error('AuthStore: Email update failed:', error);
          let errorMessage = 'Erreur lors de la mise à jour de l\'email';
          
          if (error instanceof BackendApiError) {
            if (error.status === 409) {
              errorMessage = 'Cet email est déjà utilisé par un autre compte';
            } else if (error.status === 400) {
              errorMessage = 'Format d\'email invalide';
            }
          }
          
          set({ 
            error: errorMessage,
            loading: false 
          });
          throw error;
        }
      },

      resetPassword: async (email: string, newPassword: string) => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Resetting password for email:', email);
          
          await backendApi.resetPassword(email, newPassword);
          
          set({ loading: false });
          console.log('AuthStore: Password reset successful');
        } catch (error) {
          console.error('AuthStore: Password reset failed:', error);
          set({ 
            error: 'Erreur lors de la réinitialisation du mot de passe',
            loading: false 
          });
          throw error;
        }
      },

      updateNotificationToken: async (notificationToken: string) => {
        try {
          set({ loading: true, error: null });
          console.log('AuthStore: Updating notification token');
          
          const updatedUser = await backendApi.updateNotificationToken(notificationToken);
          
          set({ 
            user: updatedUser,
            loading: false 
          });
          
          console.log('AuthStore: Notification token updated successfully');
        } catch (error) {
          console.error('AuthStore: Notification token update failed:', error);
          set({ 
            error: 'Erreur lors de la mise à jour du token de notification',
            loading: false 
          });
          throw error;
        }
      },

      registerForNotifications: async () => {
        try {
          console.log('AuthStore: Starting notification registration');
          
          const result = await notificationService.registerForPushNotifications();
          
          if (result.success && result.token) {
            console.log('AuthStore: Push token obtained, sending to backend');
            await get().updateNotificationToken(result.token);
          } else {
            console.log('AuthStore: Failed to obtain push token or permission denied');
            if (!result.permissionStatus.granted) {
              console.log('AuthStore: User denied notification permission');
            }
          }
        } catch (error) {
          console.error('AuthStore: Notification registration failed:', error);
          // Don't throw - notifications are optional
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Internal actions
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not loading/error states
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Helper hook to initialize auth state on app start
export const useAuthInitializer = () => {
  const { refreshUser, setLoading } = useAuthStore();

  const initialize = async () => {
    const token = await AsyncStorage.getItem('access_token');
    
    if (token) {
      try {
        setLoading(true);
        console.log('AuthStore: Token found, refreshing user profile');
        await refreshUser();
      } catch (error) {
        console.log('AuthStore: Token invalid, user will remain logged out', error);
        // refreshUser already handles cleanup
      } finally {
        setLoading(false);
      }
    } else {
      console.log('AuthStore: No token found');
      setLoading(false);
    }
  };

  return { initialize };
};
