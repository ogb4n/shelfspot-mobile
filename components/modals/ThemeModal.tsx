import { ThemedText } from '@/components/ThemedText';
import { ThemeSelector } from '@/components/ThemeSelector';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeMode } from '@/stores/theme';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  onThemeChange?: (theme: ThemeMode) => void;
}

export function ThemeModal({ visible, onClose, onThemeChange }: ThemeModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handleThemeChange = (theme: ThemeMode) => {
    onThemeChange?.(theme);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={{ color: colors.text }}>
              Appearance
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ThemeSelector onThemeChange={handleThemeChange} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
