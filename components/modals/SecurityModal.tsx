import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SecurityModalProps {
  visible: boolean;
  onClose: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => void;
}

export default function SecurityModal({
  visible,
  onClose,
  onChangePassword,
}: SecurityModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidForm = currentPassword.length > 0 && 
                     newPassword.length >= 6 && 
                     newPassword === confirmPassword;

  const handleSave = () => {
    if (!isValidForm) {
      Alert.alert(
        'Erreur',
        'Veuillez vérifier que tous les champs sont remplis correctement.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Erreur',
        'La confirmation du mot de passe ne correspond pas.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Erreur',
        'Le nouveau mot de passe doit contenir au moins 6 caractères.',
        [{ text: 'OK' }]
      );
      return;
    }

    onChangePassword(currentPassword, newPassword);
    handleClose();
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const PasswordInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    showPassword, 
    onToggleShow 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleShow: () => void;
  }) => (
    <View style={styles.formGroup}>
      <ThemedText style={[styles.label, { color: colors.text }]}>
        {label}
      </ThemedText>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.passwordInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onToggleShow}
        >
          <IconSymbol
            name={showPassword ? 'eye.slash' : 'eye'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
                Annuler
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: colors.text }]}>
              Sécurité
            </ThemedText>
            
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.headerButton}
              disabled={!isValidForm}
            >
              <ThemedText 
                style={[
                  styles.headerButtonText, 
                  { 
                    color: isValidForm ? colors.primary : colors.textSecondary 
                  }
                ]}
              >
                Sauvegarder
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Security Icon */}
            <View style={styles.iconSection}>
              <View style={[styles.securityIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol name="lock.shield" size={32} color={colors.primary} />
              </View>
              <ThemedText style={[styles.iconTitle, { color: colors.text }]}>
                Changer le mot de passe
              </ThemedText>
              <ThemedText style={[styles.iconSubtitle, { color: colors.textSecondary }]}>
                Sécurisez votre compte avec un nouveau mot de passe
              </ThemedText>
            </View>

            {/* Form Section */}
            <View style={styles.section}>
              <PasswordInput
                label="Mot de passe actuel"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Entrez votre mot de passe actuel"
                showPassword={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <PasswordInput
                label="Nouveau mot de passe"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Entrez votre nouveau mot de passe"
                showPassword={showNewPassword}
                onToggleShow={() => setShowNewPassword(!showNewPassword)}
              />

              <PasswordInput
                label="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmez votre nouveau mot de passe"
                showPassword={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </View>

            {/* Password Requirements */}
            <View style={[styles.requirementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.requirementsHeader}>
                <View style={[styles.requirementsIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="checkmark.shield" size={20} color={colors.primary} />
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.requirementsTitle, { color: colors.text }]}>
                  Exigences du mot de passe
                </ThemedText>
              </View>
              <View style={styles.requirementsList}>
                <View style={styles.requirement}>
                  <IconSymbol 
                    name={newPassword.length >= 6 ? 'checkmark.circle.fill' : 'circle'} 
                    size={16} 
                    color={newPassword.length >= 6 ? colors.success : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.requirementText, { color: colors.textSecondary }]}>
                    Au moins 6 caractères
                  </ThemedText>
                </View>
                <View style={styles.requirement}>
                  <IconSymbol 
                    name={newPassword === confirmPassword && newPassword.length > 0 ? 'checkmark.circle.fill' : 'circle'} 
                    size={16} 
                    color={newPassword === confirmPassword && newPassword.length > 0 ? colors.success : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.requirementText, { color: colors.textSecondary }]}>
                    Confirmation identique
                  </ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 80,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  securityIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  iconSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  section: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 2,
  },
  requirementsCard: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requirementsTitle: {
    fontSize: 16,
  },
  requirementsList: {
    gap: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 14,
  },
});
