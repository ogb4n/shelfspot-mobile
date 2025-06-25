import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <IconSymbol name="house.fill" size={48} color="#FFFFFF" />
          </View>
          <ThemedText type="title" style={[styles.appName, { color: colors.text }]}>
            ShelfSpot
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
            Gérez votre inventaire domestique simplement
          </ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <ThemedText type="subtitle" style={[styles.formTitle, { color: colors.text }]}>
            {isLogin ? 'Connexion' : 'Inscription'}
          </ThemedText>

          {!isLogin && (
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <IconSymbol name="person" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nom complet"
                placeholderTextColor={colors.textSecondary}
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
              placeholder="Mot de passe"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Mot de passe oublié ?
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
            <ThemedText style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
              {isLogin ? 'Se connecter' : "S'inscrire"}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.dividerText, { color: colors.textSecondary }]}>
              OU
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="apple.logo" size={20} color={colors.text} />
            <ThemedText style={[styles.socialButtonText, { color: colors.text }]}>
              Continuer avec Apple
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="globe" size={20} color={colors.text} />
            <ThemedText style={[styles.socialButtonText, { color: colors.text }]}>
              Continuer avec Google
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
            {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
          </ThemedText>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <ThemedText style={[styles.footerLink, { color: colors.primary }]}>
              {isLogin ? "S'inscrire" : 'Se connecter'}
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
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
