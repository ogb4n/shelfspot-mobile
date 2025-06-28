import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ConnectionStatusProps {
  status: 'idle' | 'testing' | 'success' | 'error';
  serverInfo?: {
    version: string;
    timestamp: string;
    message: string;
  } | null;
  error?: string | null;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function ConnectionStatus({ 
  status, 
  serverInfo, 
  error, 
  onRetry, 
  showDetails = false 
}: ConnectionStatusProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getStatusColor = () => {
    switch (status) {
      case 'testing': return colors.primary;
      case 'success': return '#10B981'; // Green
      case 'error': return '#EF4444'; // Red
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'testing': return 'clock.fill';
      case 'success': return 'checkmark.circle.fill';
      case 'error': return 'xmark.circle.fill';
      default: return 'circle';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'testing': return 'Test en cours...';
      case 'success': return 'Connexion réussie';
      case 'error': return 'Échec de la connexion';
      default: return 'Non testé';
    }
  };

  return (
    <View style={styles.container}>
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
      
      {/* Server Information */}
      {status === 'success' && serverInfo && showDetails && (
        <View style={[styles.infoContainer, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            Version: {serverInfo.version}
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            Dernière réponse: {new Date(serverInfo.timestamp).toLocaleTimeString()}
          </ThemedText>
        </View>
      )}
      
      {/* Error Information */}
      {status === 'error' && error && (
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>
            {error}
          </ThemedText>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <IconSymbol name="arrow.clockwise" size={14} color={colors.primary} />
              <ThemedText style={[styles.retryText, { color: colors.primary }]}>
                Réessayer
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
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
  infoContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  infoText: {
    fontSize: 12,
    marginVertical: 2,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
