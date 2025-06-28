import EditNameModal from '@/components/modals/EditNameModal';
import NotificationsModal from '@/components/modals/NotificationsModal';
import PersonalInfoModal from '@/components/modals/PersonalInfoModal';
import SecurityModal from '@/components/modals/SecurityModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { themeMode, setThemeMode } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // État pour la modal des informations personnelles
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  
  // État pour la modal d'édition du nom
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  
  // État pour la modal de sécurité
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  // État pour la modal des notifications
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Données utilisateur avec état
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin' as const,
  });

  // Paramètres de notifications avec état
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    inventoryAlerts: true,
    systemUpdates: true,
    lowStockAlerts: true,
    weeklyReports: false,
  });

  const handleSavePersonalInfo = (name: string, email: string) => {
    setUser(prev => ({ ...prev, name, email }));
  };

  const handleSaveName = (name: string) => {
    setUser(prev => ({ ...prev, name }));
  };

  const handleChangePassword = (currentPassword: string, newPassword: string) => {
    // Ici vous pouvez ajouter la logique pour changer le mot de passe
    console.log('Changement de mot de passe:', { currentPassword, newPassword });
    // Exemple : appel API pour changer le mot de passe
  };

  const handleSaveNotifications = (settings: typeof notificationSettings) => {
    setNotificationSettings(settings);
    console.log('Paramètres de notifications sauvegardés:', settings);
    // Ici vous pouvez ajouter la logique pour sauvegarder les paramètres
  };

  const handleLogout = () => {
    // Redirection vers l'écran de configuration du serveur
    router.replace('/server-config');
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
          <IconSymbol name={icon} size={20} color={colors.primary} />
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Paramètres
          </ThemedText>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={[styles.avatarText, { color: '#FFFFFF' }]}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={styles.profileDetails}>
              <ThemedText type="defaultSemiBold" style={[styles.userName, { color: colors.text }]}>
                {user.name}
              </ThemedText>
              <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user.email}
              </ThemedText>
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <ThemedText style={[styles.roleText, { color: '#FFFFFF' }]}>
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
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
        <SectionHeader title="Compte" />
        <View style={styles.section}>
          <SettingItem
            icon="person.circle"
            title="Informations personnelles"
            subtitle="Nom, email, mot de passe"
            onPress={() => setShowPersonalInfoModal(true)}
          />
          <SettingItem
            icon="bell"
            title="Notifications"
            subtitle="Gérer les alertes et notifications"
            onPress={() => setShowNotificationsModal(true)}
          />
          <SettingItem
            icon="lock"
            title="Sécurité"
            subtitle="Mot de passe et authentification"
            onPress={() => setShowSecurityModal(true)}
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="Application" />
        <View style={styles.section}>
          {/* Theme Section */}
          <View style={[styles.themeSection, { backgroundColor: colors.card }]}>
            <View style={styles.themeSectionHeader}>
              <View style={[styles.settingIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <IconSymbol name="paintbrush" size={20} color={colors.primary} />
              </View>
              <ThemedText type="defaultSemiBold" style={[styles.settingTitle, { color: colors.text }]}>
                Thème de l'application
              </ThemedText>
            </View>
            
            <View style={styles.themeOptions}>
              {/* Auto Theme */}
              <TouchableOpacity 
                style={[styles.themeOption, { borderColor: colors.border }]}
                onPress={() => setThemeMode('auto')}
              >
                <View style={styles.themeOptionLeft}>
                  <IconSymbol name="gear" size={18} color={colors.textSecondary} />
                  <ThemedText style={[styles.themeOptionText, { color: colors.text }]}>
                    Automatique
                  </ThemedText>
                </View>
                <View style={[
                  styles.radioButton, 
                  { 
                    borderColor: themeMode === 'auto' ? colors.primary : colors.border,
                    backgroundColor: themeMode === 'auto' ? colors.primary : 'transparent'
                  }
                ]}>
                  {themeMode === 'auto' && (
                    <View style={[styles.radioButtonInner, { backgroundColor: '#FFFFFF' }]} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Light Theme */}
              <TouchableOpacity 
                style={[styles.themeOption, { borderColor: colors.border }]}
                onPress={() => setThemeMode('light')}
              >
                <View style={styles.themeOptionLeft}>
                  <IconSymbol name="sun.max.fill" size={18} color={colors.textSecondary} />
                  <ThemedText style={[styles.themeOptionText, { color: colors.text }]}>
                    Clair
                  </ThemedText>
                </View>
                <View style={[
                  styles.radioButton, 
                  { 
                    borderColor: themeMode === 'light' ? colors.primary : colors.border,
                    backgroundColor: themeMode === 'light' ? colors.primary : 'transparent'
                  }
                ]}>
                  {themeMode === 'light' && (
                    <View style={[styles.radioButtonInner, { backgroundColor: '#FFFFFF' }]} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Dark Theme */}
              <TouchableOpacity 
                style={[styles.themeOption, { borderColor: colors.border }]}
                onPress={() => setThemeMode('dark')}
              >
                <View style={styles.themeOptionLeft}>
                  <IconSymbol name="moon.fill" size={18} color={colors.textSecondary} />
                  <ThemedText style={[styles.themeOptionText, { color: colors.text }]}>
                    Sombre
                  </ThemedText>
                </View>
                <View style={[
                  styles.radioButton, 
                  { 
                    borderColor: themeMode === 'dark' ? colors.primary : colors.border,
                    backgroundColor: themeMode === 'dark' ? colors.primary : 'transparent'
                  }
                ]}>
                  {themeMode === 'dark' && (
                    <View style={[styles.radioButtonInner, { backgroundColor: '#FFFFFF' }]} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <SettingItem
            icon="globe"
            title="Langue"
            subtitle="Français"
            onPress={() => {}}
          />
          <SettingItem
            icon="arrow.down.circle"
            title="Sauvegarde"
            subtitle="Exporter les données"
            onPress={() => {}}
          />
        </View>

        {/* Admin Settings */}
        {user.role === 'admin' && (
          <>
            <SectionHeader title="Administration" />
            <View style={styles.section}>
              <SettingItem
                icon="person.2"
                title="Gestion des utilisateurs"
                subtitle="Ajouter, modifier, supprimer des utilisateurs"
                onPress={() => {}}
              />
              <SettingItem
                icon="chart.bar"
                title="Statistiques"
                subtitle="Tableau de bord avancé"
                onPress={() => {}}
              />
              <SettingItem
                icon="gear"
                title="Configuration système"
                subtitle="Paramètres globaux"
                onPress={() => {}}
              />
            </View>
          </>
        )}

        {/* Support */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            icon="questionmark.circle"
            title="Aide"
            subtitle="FAQ et documentation"
            onPress={() => {}}
          />
          <SettingItem
            icon="envelope"
            title="Nous contacter"
            subtitle="Envoyer vos commentaires"
            onPress={() => {}}
          />
          <SettingItem
            icon="info.circle"
            title="À propos"
            subtitle="Version 1.0.0"
            onPress={() => {}}
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
              Se déconnecter
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal des informations personnelles */}
      <PersonalInfoModal
        visible={showPersonalInfoModal}
        onClose={() => setShowPersonalInfoModal(false)}
        currentName={user.name}
        currentEmail={user.email}
        onSave={handleSavePersonalInfo}
      />

      {/* Modal d'édition du nom */}
      <EditNameModal
        visible={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        currentName={user.name}
        onSave={handleSaveName}
      />

      {/* Modal de sécurité */}
      <SecurityModal
        visible={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onChangePassword={handleChangePassword}
      />

      {/* Modal des notifications */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        currentSettings={notificationSettings}
        onSave={handleSaveNotifications}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
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
});
