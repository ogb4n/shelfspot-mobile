import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PersonalInfoModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  onSave: (name: string, email: string) => Promise<void>;
  loading?: boolean;
}

export default function PersonalInfoModal({
  visible,
  onClose,
  currentName,
  currentEmail,
  onSave,
  loading = false,
}: PersonalInfoModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);

  // Mettre à jour les champs quand les props changent
  useEffect(() => {
    setName(currentName);
    setEmail(currentEmail);
  }, [currentName, currentEmail]);

  // Validation des champs
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && isValidEmail(email.trim());

  const handleSave = async () => {
    try {
      await onSave(name.trim(), email.trim());
      // La modal sera fermée par le parent en cas de succès
    } catch (error) {
      // L'erreur sera gérée par le parent
      console.error('Erreur dans PersonalInfoModal:', error);
    }
  };

  const handleClose = () => {
    // Reset to original values
    setName(currentName);
    setEmail(currentEmail);
    onClose();
  };

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
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.headerButton}
              disabled={loading}
            >
              <ThemedText style={[
                styles.headerButtonText, 
                { color: loading ? colors.textSecondary : colors.primary }
              ]}>
                Annuler
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: colors.text }]}>
              Informations personnelles
            </ThemedText>
            
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.headerButton}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <ThemedText style={[
                  styles.headerButtonText, 
                  { 
                    color: !isFormValid 
                      ? colors.textSecondary 
                      : colors.primary 
                  }
                ]}>
                  Sauvegarder
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Form Section */}
            <View style={styles.section}>
              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Nom complet
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                      opacity: loading ? 0.6 : 1,
                    }
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Entrez votre nom"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={[styles.label, { color: colors.text }]}>
                  Adresse email
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: email.trim() && !isValidEmail(email.trim()) 
                        ? colors.error 
                        : colors.border,
                      color: colors.text,
                      opacity: loading ? 0.6 : 1,
                    }
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Entrez votre email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {email.trim() && !isValidEmail(email.trim()) && (
                  <ThemedText style={[styles.errorText, { color: colors.error }]}>
                    Format d'email invalide
                  </ThemedText>
                )}
              </View>
            </View>

            {/* Privacy Information Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoHeader}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="lock.shield" size={20} color={colors.primary} />
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.infoTitle, { color: colors.text }]}>
                  Confidentialité
                </ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                Vos informations personnelles sont stockées de manière sécurisée et ne sont 
                jamais partagées avec des tiers. Seuls les administrateurs autorisés peuvent 
                accéder à ces données dans le cadre de la gestion de votre compte.
              </ThemedText>
            </View>

            {/* Email limitation notice */}
            <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <View style={styles.infoHeader}>
                <View style={[styles.infoIcon, { backgroundColor: colors.textSecondary + '20' }]}>
                  <IconSymbol name="info.circle" size={20} color={colors.textSecondary} />
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.infoTitle, { color: colors.text }]}>
                  Modification d'email
                </ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                La modification de l'adresse email nécessite une validation supplémentaire. 
                Contactez un administrateur si vous devez changer votre adresse email.
              </ThemedText>
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
  section: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
