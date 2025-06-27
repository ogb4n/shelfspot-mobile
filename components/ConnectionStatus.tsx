import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useConfigStore } from '@/stores/config';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ConnectionStatusProps {
  showDetails?: boolean;
  style?: any;
}

export function ConnectionStatus({ showDetails = true, style }: ConnectionStatusProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { 
    connectionStatus, 
    serverInfo, 
    error, 
    isLoading 
  } = useConfigStore();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return colors.primary;
      case 'success': return '#10B981'; // Green
      case 'error': return '#EF4444'; // Red
      default: return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return isLoading ? 'Test en cours...' : 'Test en cours';
      case 'success': return 'Connexion réussie';
      case 'error': return 'Échec de la connexion';
      default: return 'Non testé';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return 'clock.fill';
      case 'success': return 'checkmark.circle.fill';
      case 'error': return 'xmark.circle.fill';
      default: return 'circle';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <IconSymbol 
          name={getStatusIcon()} 
          size={16} 
          color={getStatusColor()} 
        />
        <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
          État: {getStatusText()}
        </ThemedText>
      </View>
      
      {showDetails && connectionStatus === 'success' && serverInfo && (
        <View style={[styles.detailsContainer, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            Version: {serverInfo.version}
          </ThemedText>
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            Dernière réponse: {new Date(serverInfo.timestamp).toLocaleTimeString()}
          </ThemedText>
        </View>
      )}
      
      {showDetails && connectionStatus === 'error' && error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            {error}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginVertical: 2,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    color: '#EF4444',
  },
});
