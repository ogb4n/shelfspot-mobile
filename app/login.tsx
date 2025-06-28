import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // Use Zustand stores
  const {
    login,
    register,
    loading: authLoading,
    error: authError,
    clearError
  } = useAuthStore();

  const { serverIp } = useConfigStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    clearError();

    try {
      await login(email.trim(), password);
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      // Error is already handled in the store
      console.error('Login error:', error);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      console.error('Register error: All fields are required');
      return;
    }

    if (name.length < 5) {
      console.error('Register error: Name must be at least 5 characters long');
      return;
    }

    if (password.length < 8) {
      console.error('Register error: Password must be at least 8 characters long');
      return;
    }

    clearError();

    try {
      console.log('Registering with:', { email, password, name });
      await register(email.trim(), password, name.trim());
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      // Error is already handled in the store
      console.error('Register error:', error);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const navigateToServerConfig = () => {
    router.push('/server-config');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <IconSymbol name="house.fill" size={32} color="#FFFFFF" />
          </View>
          <ThemedText type="title" style={[styles.appName, { color: colors.text }]}>
            ShelfSpot
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
            Your smart home inventory
          </ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <ThemedText type="subtitle" style={[styles.formTitle, { color: colors.text }]}>
            {isLogin ? 'Login' : 'Sign Up'}
          </ThemedText>

          {!isLogin && (
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <IconSymbol name="person" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="envelope" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="lock" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot password?
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Error Display */}
          {authError ? (
            <View style={[styles.errorContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
              <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>
                {authError}
              </ThemedText>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: authLoading ? colors.textSecondary : colors.primary },
            ]}
            onPress={handleSubmit}
            disabled={authLoading}
          >
            <ThemedText style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
              {authLoading ? 'Loading...' : (isLogin ? 'Sign In' : "Sign Up")}
            </ThemedText>
          </TouchableOpacity>

          {/* Server Configuration Button */}
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={navigateToServerConfig}
          >
            <IconSymbol name="gear" size={16} color={colors.primary} />
            <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Server Configuration
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </ThemedText>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <ThemedText style={[styles.footerLink, { color: colors.primary }]}>
              {isLogin ? "Sign Up" : 'Sign In'}
            </ThemedText>
          </TouchableOpacity>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -80,
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
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
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
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
