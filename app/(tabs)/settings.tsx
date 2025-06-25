import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin' as const,
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: string;
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
          <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: colors.backgroundSecondary }]}>
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
            onPress={() => {}}
          />
          <SettingItem
            icon="bell"
            title="Notifications"
            subtitle="Gérer les alertes et notifications"
            onPress={() => {}}
          />
          <SettingItem
            icon="lock"
            title="Sécurité"
            subtitle="Mot de passe et authentification"
            onPress={() => {}}
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="Application" />
        <View style={styles.section}>
          <SettingItem
            icon="paintbrush"
            title="Thème"
            subtitle={colorScheme === 'dark' ? 'Sombre' : 'Clair'}
            rightComponent={
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={() => {}}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor={colorScheme === 'dark' ? '#FFFFFF' : colors.textSecondary}
              />
            }
            showArrow={false}
          />
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
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]}>
            <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
            <ThemedText style={[styles.logoutText, { color: '#FFFFFF' }]}>
              Se déconnecter
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});
