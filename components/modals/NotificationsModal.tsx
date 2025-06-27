import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  inventoryAlerts: boolean;
  systemUpdates: boolean;
  lowStockAlerts: boolean;
  weeklyReports: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  currentSettings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  currentSettings,
  onSave,
}: NotificationsModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [settings, setSettings] = useState<NotificationSettings>(currentSettings);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleClose = () => {
    // Reset to original settings
    setSettings(currentSettings);
    onClose();
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const NotificationItem = ({ 
    title, 
    description, 
    icon, 
    value, 
    onToggle 
  }: {
    title: string;
    description: string;
    icon: any;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={[styles.notificationItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.notificationLeft}>
        <View style={[styles.notificationIcon, { backgroundColor: colors.primary + '20' }]}>
          <IconSymbol name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.notificationContent}>
          <ThemedText type="defaultSemiBold" style={[styles.notificationTitle, { color: colors.text }]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.notificationDescription, { color: colors.textSecondary }]}>
            {description}
          </ThemedText>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ 
          false: colors.border, 
          true: colors.primary + '40' 
        }}
        thumbColor={value ? colors.primary : colors.textSecondary}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
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
            Notifications
          </ThemedText>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
              Sauvegarder
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Notification Icon */}
          <View style={styles.iconSection}>
            <View style={[styles.mainIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol name="bell.fill" size={32} color={colors.primary} />
            </View>
            <ThemedText style={[styles.iconTitle, { color: colors.text }]}>
              Préférences de notifications
            </ThemedText>
            <ThemedText style={[styles.iconSubtitle, { color: colors.textSecondary }]}>
              Gérez comment et quand vous souhaitez être notifié
            </ThemedText>
          </View>

          {/* General Section */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
              Général
            </ThemedText>
            
            <NotificationItem
              title="Notifications push"
              description="Recevoir des notifications sur votre appareil"
              icon="bell"
              value={settings.pushNotifications}
              onToggle={(value) => updateSetting('pushNotifications', value)}
            />
            
            <NotificationItem
              title="Notifications email"
              description="Recevoir des notifications par email"
              icon="envelope"
              value={settings.emailNotifications}
              onToggle={(value) => updateSetting('emailNotifications', value)}
            />
          </View>

          {/* Inventory Section */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
              Inventaire
            </ThemedText>
            
            <NotificationItem
              title="Alertes d'inventaire"
              description="Notifications pour les changements d'inventaire"
              icon="cube.box"
              value={settings.inventoryAlerts}
              onToggle={(value) => updateSetting('inventoryAlerts', value)}
            />
            
            <NotificationItem
              title="Stock faible"
              description="Alertes quand les stocks sont bas"
              icon="exclamationmark.triangle"
              value={settings.lowStockAlerts}
              onToggle={(value) => updateSetting('lowStockAlerts', value)}
            />
          </View>

          {/* System Section */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
              Système
            </ThemedText>
            
            <NotificationItem
              title="Mises à jour système"
              description="Notifications pour les mises à jour importantes"
              icon="gear"
              value={settings.systemUpdates}
              onToggle={(value) => updateSetting('systemUpdates', value)}
            />
            
            <NotificationItem
              title="Rapports hebdomadaires"
              description="Résumé d'activité chaque semaine"
              icon="chart.bar"
              value={settings.weeklyReports}
              onToggle={(value) => updateSetting('weeklyReports', value)}
            />
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIcon, { backgroundColor: colors.info + '20' }]}>
                <IconSymbol name="info.circle" size={20} color={colors.info} />
              </View>
              <ThemedText type="defaultSemiBold" style={[styles.infoTitle, { color: colors.text }]}>
                À propos des notifications
              </ThemedText>
            </View>
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              Vous pouvez modifier ces paramètres à tout moment. Les notifications push 
              nécessitent l'autorisation de votre système d'exploitation pour fonctionner.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  mainIcon: {
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
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 18,
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
