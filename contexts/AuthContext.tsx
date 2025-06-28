import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendApi, User } from '@/services/backend-api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    // Avoid double-initialization
    if (isInitialized) {
      console.log("AuthContext: Already initialized, skipping");
      return;
    }

    const initAuth = async () => {
      console.log("AuthContext: Initializing authentication");
      setIsInitialized(true);

      const token = await AsyncStorage.getItem('access_token');
      console.log("AuthContext: Token found:", !!token);

      if (token) {
        try {
          console.log("AuthContext: Getting profile from backend");
          const profile = await backendApi.getProfile();
          console.log("AuthContext: Profile received:", profile);
          setUser(profile);
        } catch (error) {
          console.log("AuthContext: Profile fetch failed, removing token:", error);
          // Invalid token, remove it
          await AsyncStorage.removeItem('access_token');
        }
      }
      setLoading(false);
      console.log("AuthContext: Authentication initialization complete");
    };

    initAuth();
  }, [isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Login attempt for email:", email);
      const response = await backendApi.login(email, password);
      
      // Store the token
      await AsyncStorage.setItem('access_token', response.access_token);
      
      setUser(response.user);
      console.log("AuthContext: Login successful, user set:", response.user);
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      console.log("AuthContext: Register attempt for email:", email);
      const response = await backendApi.register(email, password, name);
      
      // Store the token
      await AsyncStorage.setItem('access_token', response.access_token);
      
      setUser(response.user);
      console.log("AuthContext: Registration successful, user set:", response.user);
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Logging out");
      await AsyncStorage.removeItem('access_token');
      setUser(null);
      console.log("AuthContext: Logout successful");
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
    }
  };

  const updateProfile = async (name: string) => {
    try {
      console.log("AuthContext: Updating profile with name:", name);
      const updatedUser = await backendApi.updateProfile(name);
      setUser(updatedUser);
      console.log("AuthContext: Profile updated successfully");
    } catch (error) {
      console.error("AuthContext: Profile update failed:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      console.log("AuthContext: Resetting password for email:", email);
      await backendApi.resetPassword(email, newPassword);
      console.log("AuthContext: Password reset successful");
    } catch (error) {
      console.error("AuthContext: Password reset failed:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      console.log("AuthContext: Refreshing user profile");
      const profile = await backendApi.getProfile();
      setUser(profile);
      console.log("AuthContext: User profile refreshed");
    } catch (error) {
      console.error("AuthContext: User refresh failed:", error);
      // If error is due to invalid token, logout the user
      await AsyncStorage.removeItem('access_token');
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
