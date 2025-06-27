import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useConfigStore } from '@/stores/config';
import { ConnectionStatus } from '@/components/ConnectionStatus';

export default function ServerConfigScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [ipInput, setIpInput] = useState('');
  
  const { 
    serverIp, 
    connectionStatus, 
    serverInfo,
    isLoading,
    setServerIp, 
    testConnection,
    clearError 
  } = useConfigStore();

  useEffect(() => {
    // Initialize input with current server IP
    setIpInput(serverIp);
  }, [serverIp]);

  const handleSaveConfig = async () => {
    if (!ipInput.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse IP valide');
      return;
    }

    clearError();
    
    try {
      await setServerIp(ipInput.trim());
      Alert.alert('Succès', 'Configuration sauvegardée');
    } catch (error) {
      console.error('Error saving config:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la configuration');
    }
  };

  const handleTestConnection = async () => {
    if (!ipInput.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse IP valide');
      return;
    }

    clearError();
    
    try {
      // Save IP first if different
      if (ipInput.trim() !== serverIp) {
        await setServerIp(ipInput.trim());
      }
      
      const success = await testConnection();
      
      if (success) {
        Alert.alert(
          'Connexion réussie',
          `Serveur accessible à l'adresse ${ipInput.trim()}`,
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Test connection error:', error);
      // Error is already handled in the store
    }
  };

  const handleContinue = () => {
    if (connectionStatus === 'success' || connectionStatus === 'idle') {
      router.replace('/login');
    } else {
      Alert.alert(
        'Test de connexion recommandé',
        'Il est recommandé de tester la connexion avant de continuer.',
        [
          {
            text: 'Tester',
            onPress: handleTestConnection
          },
          {
            text: 'Continuer quand même',
            onPress: () => router.replace('/login'),
            style: 'destructive'
          }
        ]
      );
    }
  };





  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Configuration Serveur</ThemedText>
        <ThemedText style={styles.subtitle}>
          Configurez l&apos;adresse IP de votre serveur ShelfSpot
        </ThemedText>

        <View style={styles.form}>
          <ThemedText style={styles.label}>Adresse IP du serveur :</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.text,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            value={ipInput}
            onChangeText={setIpInput}
            placeholder="ex: 192.168.1.100"
            placeholderTextColor={colors.text + '80'}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <ConnectionStatus 
            style={styles.statusContainer}
          />

          {serverInfo && connectionStatus === 'success' && (
            <View style={styles.serverInfoContainer}>
              <ThemedText style={styles.serverInfoTitle}>Informations du serveur :</ThemedText>
              <ThemedText style={styles.serverInfoText}>Version: {serverInfo.version}</ThemedText>
              <ThemedText style={styles.serverInfoText}>
                Dernière connexion: {new Date(serverInfo.timestamp).toLocaleString()}
              </ThemedText>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.tint },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSaveConfig}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sauvegarder</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.testButton,
                { borderColor: colors.tint },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleTestConnection}
              disabled={isLoading}
            >
              {connectionStatus === 'testing' ? (
                <ActivityIndicator color={colors.tint} size="small" />
              ) : (
                <Text style={[styles.buttonTextSecondary, { color: colors.tint }]}>
                  Tester la connexion
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.continueButton,
                { backgroundColor: connectionStatus === 'success' ? '#4CAF50' : colors.text + '40' },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 20,
  },
  serverInfoContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    marginBottom: 20,
  },
  serverInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2E7D32',
  },
  serverInfoText: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButton: {
    // backgroundColor is set dynamically
  },
  testButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  continueButton: {
    // backgroundColor is set dynamically
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
});
