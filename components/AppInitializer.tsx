import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppStore } from '@/stores/app';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { isInitialized, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
