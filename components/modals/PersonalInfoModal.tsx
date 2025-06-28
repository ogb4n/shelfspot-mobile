import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import {
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
  onSave: (name: string, email: string) => void;
}

export default function PersonalInfoModal({
  visible,
  onClose,
  currentName,
  currentEmail,
  onSave,
}: PersonalInfoModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);

  const handleSave = () => {
    onSave(name, email);
    onClose();
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
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
                Annuler
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: colors.text }]}>
              Informations personnelles
            </ThemedText>
            
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
                Sauvegarder
              </ThemedText>
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
                    }
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Entrez votre nom"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
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
                      borderColor: colors.border,
                      color: colors.text,
                    }
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Entrez votre email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
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
