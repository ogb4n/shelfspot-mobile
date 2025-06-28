import { useState, useCallback } from 'react';
import { configService } from '@/services/config';
import { backendApi } from '@/services/backend-api';

export interface ServerConnectionInfo {
  isConnected: boolean;
  isLoading: boolean;
  serverInfo: {
    version: string;
    timestamp: string;
    message: string;
  } | null;
  error: string | null;
  lastChecked: Date | null;
}

export function useServerConnection() {
  const [connectionState, setConnectionState] = useState<ServerConnectionInfo>({
    isConnected: false,
    isLoading: false,
    serverInfo: null,
    error: null,
    lastChecked: null,
  });

  const testConnection = useCallback(async (serverIp?: string): Promise<boolean> => {
    setConnectionState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // If server IP is provided, temporarily set it
      if (serverIp) {
        await configService.setServerIp(serverIp);
      }

      // Test connection using the detailed method
      const result = await configService.testConnectionDetailed();

      if (result.success && result.data) {
        setConnectionState({
          isConnected: true,
          isLoading: false,
          serverInfo: result.data,
          error: null,
          lastChecked: new Date(),
        });
        return true;
      } else {
        setConnectionState({
          isConnected: false,
          isLoading: false,
          serverInfo: null,
          error: result.error || 'Connection failed',
          lastChecked: new Date(),
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setConnectionState({
        isConnected: false,
        isLoading: false,
        serverInfo: null,
        error: errorMessage,
        lastChecked: new Date(),
      });
      return false;
    }
  }, []);

  const testConnectionSimple = useCallback(async (): Promise<boolean> => {
    try {
      return await backendApi.testConnectionSimple();
    } catch {
      return false;
    }
  }, []);

  const clearConnectionState = useCallback(() => {
    setConnectionState({
      isConnected: false,
      isLoading: false,
      serverInfo: null,
      error: null,
      lastChecked: null,
    });
  }, []);

  return {
    connectionState,
    testConnection,
    testConnectionSimple,
    clearConnectionState,
  };
}
