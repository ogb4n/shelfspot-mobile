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
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditNameModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

export default function EditNameModal({
  visible,
  onClose,
  currentName,
  onSave,
}: EditNameModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  const handleClose = () => {
    // Reset to original value
    setName(currentName);
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
              Modifier le nom
            </ThemedText>
            
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.headerButton}
              disabled={!name.trim()}
            >
              <ThemedText 
                style={[
                  styles.headerButtonText, 
                  { 
                    color: name.trim() ? colors.primary : colors.textSecondary 
                  }
                ]}
              >
                Sauvegarder
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.section}>
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <ThemedText style={[styles.avatarText, { color: '#FFFFFF' }]}>
                  {name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.previewText, { color: colors.textSecondary }]}>
                Aperçu
              </ThemedText>
            </View>

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
                autoFocus
              />
            </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoHeader}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="info.circle" size={20} color={colors.primary} />
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.infoTitle, { color: colors.text }]}>
                  À propos du nom d'affichage
                </ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                Ce nom sera affiché dans votre profil et visible par les autres utilisateurs 
                de l'application. Vous pouvez le modifier à tout moment.
              </ThemedText>
            </View>
          </View>
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
  section: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  previewText: {
    fontSize: 14,
    fontStyle: 'italic',
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
