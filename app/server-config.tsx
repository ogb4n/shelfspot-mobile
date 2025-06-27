import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ServerConfigScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [serverIp, setServerIp] = useState('');

  const handleSubmit = () => {
    // Ici vous pourrez stocker l'IP du serveur si nécessaire
    router.replace('/login');
  };

  const handleSkip = () => {
    // Redirection directe vers l'application principale
    router.replace('/(tabs)');
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
              placeholder="192.168.1.100"
              placeholderTextColor={colors.textSecondary}
              value={serverIp}
              onChangeText={setServerIp}
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <ThemedText style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
              Valider
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            Saisissez l'adresse IP de votre serveur local
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 32,
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
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#4F7CAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});