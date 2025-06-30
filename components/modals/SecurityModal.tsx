import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/stores/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SecurityModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SecurityModal({
  visible,
  onClose,
}: SecurityModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { user, resetPassword, loading } = useAuthStore();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid = () => {
    return newPassword.length >= 8 && 
           newPassword === confirmPassword && 
           newPassword.trim() !== '' &&
           confirmPassword.trim() !== '';
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Erreur', 'Veuillez vérifier que les mots de passe sont identiques et contiennent au moins 8 caractères.');
      return;
    }

    if (!user?.email) {
      Alert.alert('Erreur', 'Email utilisateur non trouvé');
      return;
    }

    try {
      await resetPassword(user.email, newPassword);
      
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé avec succès',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      Alert.alert('Erreur', 'Impossible de réinitialiser le mot de passe');
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
              Annuler
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: colors.text }]}>
            Changer le mot de passe
          </ThemedText>
          
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={styles.headerButton}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <ThemedText 
                style={[
                  styles.headerButtonText, 
                  { 
                    color: isFormValid() ? colors.primary : colors.textSecondary 
                  }
                ]}
              >
                Sauvegarder
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <IconSymbol name="lock.shield" size={24} color={colors.primary} />
              </View>
              <ThemedText style={[styles.title, { color: colors.text }]}>
                Nouveau mot de passe
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
                Email: {user?.email}
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Nouveau mot de passe */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Nouveau mot de passe
                </ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      }
                    ]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Entrez votre nouveau mot de passe"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <IconSymbol
                      name={showNewPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmer mot de passe */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Confirmer le mot de passe
                </ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      }
                    ]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmez votre nouveau mot de passe"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Exigences */}
              <View style={[styles.requirementsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.requirementsTitle, { color: colors.text }]}>
                  Exigences du mot de passe
                </ThemedText>
                
                <View style={styles.requirement}>
                  <IconSymbol 
                    name={newPassword.length >= 8 ? 'checkmark.circle.fill' : 'circle'} 
                    size={16} 
                    color={newPassword.length >= 8 ? colors.success : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.requirementText, { color: colors.textSecondary }]}>
                    Au moins 8 caractères
                  </ThemedText>
                </View>
                
                <View style={styles.requirement}>
                  <IconSymbol 
                    name={newPassword === confirmPassword && newPassword.length > 0 && confirmPassword.length > 0 ? 'checkmark.circle.fill' : 'circle'} 
                    size={16} 
                    color={newPassword === confirmPassword && newPassword.length > 0 && confirmPassword.length > 0 ? colors.success : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.requirementText, { color: colors.textSecondary }]}>
                    Les mots de passe sont identiques
                  </ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
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
  requirementsContainer: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
  },
});
