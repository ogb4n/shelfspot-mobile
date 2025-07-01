import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  const { serverIp } = useConfigStore();
  const { isInitialized } = useAppStore();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Don't navigate until app is initialized
    if (!isInitialized || hasNavigated) return;
    
    const navigate = async () => {
      console.log('Index: Navigation check started');
      console.log('Index: serverIp:', serverIp);
      console.log('Index: isAuthenticated:', isAuthenticated);
      console.log('Index: user:', user);
      
      setHasNavigated(true);
      
      // Check if we have a server IP configured
      if (!serverIp || serverIp === '' || serverIp === 'http://192.168.1.100:3001') {
        console.log('Index: Redirecting to server-config');
        router.replace('/server-config');
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('Index: Redirecting to login');
        router.replace('/login');
        return;
      }

      // User is authenticated and server is configured - go to main app
      console.log('Index: Redirecting to tabs');
      router.replace('/(tabs)');
    };
    
    navigate();
  }, [isInitialized, isAuthenticated, user, serverIp, hasNavigated]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <ThemedText style={{ marginTop: 16 }}>
        {!isInitialized ? 'Initialisation...' : 'Chargement...'}
      </ThemedText>
    </ThemedView>
  );
}
