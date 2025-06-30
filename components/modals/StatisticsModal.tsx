import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUISettingsStore } from '@/stores/ui-settings';
import {
    Modal,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';

interface StatisticsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StatisticsModal({
  visible,
  onClose,
}: StatisticsModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { showCharts, setShowCharts } = useUISettingsStore();

  const handleClose = () => {
    onClose();
  };

  const handleToggleCharts = (value: boolean) => {
    setShowCharts(value);
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
              Fermer
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: colors.text }]}>
            Paramètres des statistiques
          </ThemedText>
          
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <IconSymbol name="chart.bar" size={24} color={colors.primary} />
            </View>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              Affichage des graphiques
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Configurez l'affichage des graphiques sur votre tableau de bord
            </ThemedText>
          </View>

          {/* Settings */}
          <View style={styles.settingsContainer}>
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '10' }]}>
                  <IconSymbol name="chart.pie" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <ThemedText style={[styles.settingTitle, { color: colors.text }]}>
                    Graphiques sur le tableau de bord
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Afficher ou masquer les graphiques statistiques sur l'écran principal
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={showCharts}
                onValueChange={handleToggleCharts}
                trackColor={{ 
                  false: colors.backgroundSecondary, 
                  true: colors.primary + '40' 
                }}
                thumbColor={showCharts ? colors.primary : colors.textSecondary}
                ios_backgroundColor={colors.backgroundSecondary}
              />
            </View>

            {/* Additional info */}
            <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.infoBoxHeader}>
                <IconSymbol name="info.circle" size={16} color={colors.primary} />
                <ThemedText style={[styles.infoBoxTitle, { color: colors.text }]}>
                  À propos des graphiques
                </ThemedText>
              </View>
              <ThemedText style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                Les graphiques incluent la répartition des articles par statut, 
                la distribution par pièces et d'autres visualisations utiles pour 
                analyser votre inventaire.
              </ThemedText>
            </View>
          </View>
        </View>
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
  content: {
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
    lineHeight: 20,
  },
  settingsContainer: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBoxText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
