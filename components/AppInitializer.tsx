import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/stores/app';
import { useInventoryStore } from '@/stores/inventory';
import { cleanupThemeListener, initializeThemeListener } from '@/stores/theme';
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { isInitialized, initialize } = useAppStore();
  const { initialize: initializeInventory } = useInventoryStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize theme listener
      initializeThemeListener();
      
      await initialize();
      await initializeInventory();
    };
    
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      cleanupThemeListener();
    };
  }, [initialize, initializeInventory]);

  if (!isInitialized) {
    return (
      <ThemedView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ 
          marginTop: 16, 
          fontSize: 16,
          color: colors.text 
        }}>
          Initialisation de ShelfSpot...
        </ThemedText>
      </ThemedView>
    );
  }

  return <>{children}</>;
}
