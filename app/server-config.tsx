import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useConfigStore } from '@/stores/config';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ServerConfigScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [serverIp, setServerIpInput] = useState('');
  
  const { 
    serverIp: currentServerIp, 
    connectionStatus, 
    serverInfo,
    isLoading,
    setServerIp, 
    testConnection,
    clearError 
  } = useConfigStore();

  useEffect(() => {
    // Load current server IP
    setServerIpInput(currentServerIp);
  }, [currentServerIp]);

  const handleTestConnection = async () => {
    if (!serverIp.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse IP');
      return;
    }

    clearError();
    
    try {
      // Save IP first if different
      if (serverIp.trim() !== currentServerIp) {
        await setServerIp(serverIp.trim());
      }
      
      const success = await testConnection();
      
      if (success && serverInfo) {
        Alert.alert(
          'Connexion réussie ✅',
          `Le serveur ShelfSpot est accessible.\nVersion: ${serverInfo.version}\n\nVoulez-vous continuer vers l'écran de connexion ?`,
          [
            { text: 'Retester', style: 'cancel' },
            { text: 'Continuer', onPress: () => router.replace('/login') }
          ]
        );
      } else if (!success) {
        const errorMsg = 'Erreur de connexion';
        Alert.alert(
          'Échec de la connexion ❌',
          `Impossible de se connecter au serveur ShelfSpot.\n\nErreur: ${errorMsg}\n\nVérifiez:\n• L'adresse URL est correcte\n• Le serveur est démarré\n• Vous êtes sur le même réseau`,
          [
            { text: 'Réessayer', style: 'default' },
            { text: 'Continuer quand même', style: 'destructive', onPress: () => router.replace('/login') }
          ]
        );
      }
    } catch (error) {
      console.error('Test connection error:', error);
    }
  };

  const handleSkip = () => {
    // Skip to login with default IP
    router.replace('/login');
  };

  const handleSubmit = async () => {
    if (!serverIp.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse URL valide');
      return;
    }

    try {
      await setServerIp(serverIp.trim());
      router.replace('/login');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'adresse URL');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <ThemedText style={[styles.skipText, { color: colors.textSecondary }]}>
            Ignorer
          </ThemedText>
        </TouchableOpacity>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <IconSymbol name="house.fill" size={32} color="#FFFFFF" />
          </View>
          <ThemedText type="title" style={[styles.appName, { color: colors.text }]}>
            ShelfSpot
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
            Configuration du serveur
          </ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <ThemedText type="subtitle" style={[styles.formTitle, { color: colors.text }]}>
            Adresse du serveur
          </ThemedText>

          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="server.rack" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="http://192.168.1.100:3001"
              placeholderTextColor={colors.textSecondary}
              value={serverIp}
              onChangeText={setServerIpInput}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Connection Status */}
          <ConnectionStatus
            status={
              isLoading ? 'testing' :
              connectionStatus === 'success' ? 'success' :
              connectionStatus === 'error' ? 'error' : 'idle'
            }
            serverInfo={serverInfo}
            error={connectionStatus === 'error' ? 'Erreur de connexion' : undefined}
            onRetry={handleTestConnection}
            showDetails={true}
          />

          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            Saisissez l&apos;URL complète de votre serveur local (exemple: http://192.168.1.100:3001)
          </ThemedText>

          {/* Buttons */}
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              { backgroundColor: isLoading ? colors.textSecondary : colors.primary }
            ]}
            onPress={handleTestConnection}
            disabled={isLoading}
          >
            <ThemedText style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
              {isLoading ? 'Test en cours...' : 'Tester la connexion'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Confirmer et continuer
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Vous pouvez modifier cette configuration plus tard dans les paramètres
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: 100,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: -60,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4F7CAC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  formSection: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4F7CAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
