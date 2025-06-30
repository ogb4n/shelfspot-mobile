import EditNameModal from '@/components/modals/EditNameModal';
import NotificationsModal from '@/components/modals/NotificationsModal';
import PersonalInfoModal from '@/components/modals/PersonalInfoModal';
import SecurityModal from '@/components/modals/SecurityModal';
import StatisticsModal from '@/components/modals/StatisticsModal';
import { ThemeModal } from '@/components/modals/ThemeModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/stores/auth';
import { useThemeMode } from '@/stores/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Use Zustand stores
  const { user, logout, updateProfile, loading } = useAuthStore();
  const { themeMode } = useThemeMode();

  // États pour les modales
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);

  // États pour les paramètres de notification
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    weeklyReports: false,
  });

  // Fonctions utilitaires
  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'auto': return 'Automatic';
      default: return 'Automatic';
    }
  };

  // Fonctions de gestion des modales
  const handleSavePersonalInfo = async (name: string, email: string) => {
    try {
      console.log('🔄 Saving personal info:', { name, email, currentName: user?.name, currentEmail: user?.email });
      
      let hasChanges = false;
      let successMessages = [];
      
      // Vérifier et mettre à jour le nom si nécessaire
      if (name.trim() !== user?.name?.trim()) {
        console.log('📝 Updating name from', user?.name, 'to', name.trim());
        await updateProfile(name.trim());
        hasChanges = true;
        successMessages.push('Nom mis à jour');
      }
      
      // Pour l'email, vérifier s'il a changé et informer l'utilisateur
      if (email.trim() !== user?.email?.trim()) {
        console.log('📧 Email change requested from', user?.email, 'to', email.trim());
        Alert.alert(
          'Information',
          'La modification de l\'adresse email n\'est pas encore disponible via cette interface. Contactez un administrateur si vous devez changer votre email.',
          [{ text: 'OK' }]
        );
      }
      
      if (hasChanges) {
        Alert.alert('Succès', successMessages.join(' et ') + ' avec succès');
        console.log('✅ Personal info saved successfully');
      } else if (email.trim() === user?.email?.trim()) {
        console.log('ℹ️ No changes detected');
      }
      
      setShowPersonalInfoModal(false);
    } catch (error) {
      console.error('❌ Error saving personal info:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations');
      throw error; // Propager l'erreur pour que la modal reste ouverte
    }
  };

  const handleSaveName = async (name: string) => {
    try {
      // Utiliser l'API pour mettre à jour le nom
      await updateProfile(name);
      
      console.log('✅ Name updated successfully');
      setShowEditNameModal(false);
    } catch (error) {
      console.error('❌ Error saving name:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le nom');
      throw error; // Propager l'erreur pour que la modal reste ouverte
    }
  };

  const handleSaveNotifications = (settings: typeof notificationSettings) => {
    try {
      setNotificationSettings(settings);
      setShowNotificationsModal(false);
      Alert.alert('Succès', 'Paramètres de notification sauvegardés');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const handleServerConfig = () => {
    router.push('/server-config');
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent
  }: {
    icon: any; // Type temporaire pour éviter l'erreur TypeScript
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <ThemedText type="defaultSemiBold" style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {rightComponent || (showArrow && (
        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <ThemedText type="defaultSemiBold" style={[styles.sectionHeader, { color: colors.text }]}>
      {title}
    </ThemedText>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.customHeader, { 
        backgroundColor: colors.background, 
        borderBottomColor: colors.border,
        paddingTop: insets.top + 8
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={[styles.avatarText, { color: '#FFFFFF' }]}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : user?.email?.charAt(0).toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <View style={styles.profileDetails}>
              <ThemedText type="defaultSemiBold" style={[styles.userName, { color: colors.text }]}>
                {user?.name || 'User'}
              </ThemedText>
              <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'Not defined'}
              </ThemedText>
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <ThemedText style={[styles.roleText, { color: '#FFFFFF' }]}>
                  {user?.admin ? 'Administrator' : 'User'}
                </ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.editProfileButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => setShowEditNameModal(true)}
          >
            <IconSymbol name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingItem
            icon="person.circle"
            title="Personal Information"
            subtitle="Name, email, password"
            onPress={() => setShowPersonalInfoModal(true)}
          />
          <SettingItem
            icon="bell"
            title="Notifications"
            subtitle="Manage alerts and notifications"
            onPress={() => setShowNotificationsModal(true)}
          />
          <SettingItem
            icon="lock"
            title="Security"
            subtitle="Password and authentication"
            onPress={() => setShowSecurityModal(true)}
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="Application" />
        <View style={styles.section}>
          <SettingItem
            icon="paintbrush"
            title="Theme"
            subtitle={getThemeLabel()}
            onPress={() => setShowThemeModal(true)}
          />
          <SettingItem
            icon="globe"
            title="Language"
            subtitle="English"
            onPress={() => { }}
          />
          <SettingItem
            icon="arrow.down.circle"
            title="Backup"
            subtitle="Export data"
            onPress={() => { }}
          />
        </View>

        {/* Admin Settings */}
        {user?.admin && (
          <>
            <SectionHeader title="Administration" />
            <View style={styles.section}>
              <SettingItem
                icon="person.2"
                title="User Management"
                subtitle="Add, modify, delete users"
                onPress={() => { }}
              />
              <SettingItem
                icon="chart.bar"
                title="Statistics"
                subtitle="Advanced dashboard"
                onPress={() => setShowStatisticsModal(true)}
              />
              <SettingItem
                icon="gear"
                title="System Configuration"
                subtitle="Global settings"
                onPress={() => { }}
              />
              <SettingItem
                icon="server.rack"
                title="Server Configuration"
                subtitle="Modify server IP address"
                onPress={handleServerConfig}
              />
            </View>
          </>
        )}

        {/* Support */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            icon="questionmark.circle"
            title="Help"
            subtitle="FAQ and documentation"
            onPress={() => { }}
          />
          <SettingItem
            icon="envelope"
            title="Contact Us"
            subtitle="Send your feedback"
            onPress={() => { }}
          />
          <SettingItem
            icon="info.circle"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => { }}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
            <ThemedText style={[styles.logoutText, { color: '#FFFFFF' }]}>
              Sign Out
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal des informations personnelles */}
      <PersonalInfoModal
        visible={showPersonalInfoModal}
        onClose={() => setShowPersonalInfoModal(false)}
        currentName={user?.name || ''}
        currentEmail={user?.email || ''}
        onSave={handleSavePersonalInfo}
        loading={loading}
      />

      {/* Modal d'édition du nom */}
      <EditNameModal
        visible={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        currentName={user?.name || ''}
        onSave={handleSaveName}
        loading={loading}
      />

      {/* Modal de sécurité */}
      <SecurityModal
        visible={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />

      {/* Modal des notifications */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        currentSettings={notificationSettings}
        onSave={handleSaveNotifications}
      />

      {/* Theme Modal */}
      <ThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onThemeChange={(theme) => {
          console.log('Theme changed to:', theme);
        }}
      />

      {/* Statistics Modal */}
      <StatisticsModal
        visible={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Theme section styles
  themeSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  themeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  themeOptions: {
    gap: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  autoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  autoButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
