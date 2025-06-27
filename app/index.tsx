import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  const { serverIp } = useConfigStore();

  useEffect(() => {
    // Check if we have a server IP configured
    if (!serverIp || serverIp === '' || serverIp === '192.168.1.100') {
      // Default IP or empty - go to server config
      router.replace('/server-config');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // Not authenticated - go to login
      router.replace('/login');
      return;
    }

    // User is authenticated and server is configured - go to main app
    router.replace('/(tabs)');
  }, [isAuthenticated, user, serverIp]);

  return null;
}
