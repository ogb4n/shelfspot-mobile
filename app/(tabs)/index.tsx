import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Mock data - in a real app, this would come from your state management
  const stats = {
    totalItems: 247,
    totalRooms: 8,
    totalPlaces: 23,
    lowStockItems: 12,
    favoriteItems: 18,
  };

  const quickActions = [
    { icon: 'plus.circle.fill' as const, title: 'Ajouter un objet', color: colors.primary },
    { icon: 'barcode.viewfinder' as const, title: 'Scanner', color: colors.secondary },
    { icon: 'magnifyingglass' as const, title: 'Rechercher', color: colors.info },
    { icon: 'heart.fill' as const, title: 'Favoris', color: colors.error },
  ];

  const alerts = [
    { id: '1', message: 'Stock faible: Dentifrice', time: 'Il y a 2h' },
    { id: '2', message: 'Expiration proche: Yaourts', time: 'Il y a 5h' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={[styles.welcomeText, { color: colors.text }]}>
              Bonjour! 👋
            </ThemedText>
            <ThemedText style={[styles.subtitleText, { color: colors.textSecondary }]}>
              Gérez votre inventaire facilement
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.backgroundSecondary }]}>
            <IconSymbol name="person.circle.fill" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <IconSymbol name="cube.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.statsContent}>
              <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.primary }]}>
                {stats.totalItems}
              </ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Objets totaux
              </ThemedText>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}20` }]}>
              <IconSymbol name="house.fill" size={24} color={colors.secondary} />
            </View>
            <View style={styles.statsContent}>
              <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.secondary }]}>
                {stats.totalRooms}
              </ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Pièces
              </ThemedText>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.warning} />
            </View>
            <View style={styles.statsContent}>
              <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.warning }]}>
                {stats.lowStockItems}
              </ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Stock faible
              </ThemedText>
            </View>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]}>
              <IconSymbol name="heart.fill" size={24} color={colors.error} />
            </View>
            <View style={styles.statsContent}>
              <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.error }]}>
                {stats.favoriteItems}
              </ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Favoris
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Actions rapides
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
              >
                <IconSymbol name={action.icon} size={28} color={action.color} />
                <ThemedText style={[styles.quickActionText, { color: colors.text }]}>
                  {action.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Alertes récentes
          </ThemedText>
          <View style={[styles.alertsContainer, { backgroundColor: colors.card }]}>
            {alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertItem, { borderBottomColor: colors.border }]}>
                <IconSymbol name="bell.fill" size={20} color={colors.warning} />
                <View style={styles.alertContent}>
                  <ThemedText style={[styles.alertMessage, { color: colors.text }]}>
                    {alert.message}
                  </ThemedText>
                  <ThemedText style={[styles.alertTime, { color: colors.textSecondary }]}>
                    {alert.time}
                  </ThemedText>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllButton}>
              <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
                Voir toutes les alertes
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button for Search */}
      <TouchableOpacity 
        style={[styles.searchFab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/search')}
        activeOpacity={0.8}
      >
        <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  contentContainer: {
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContent: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  alertsContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
  viewAllButton: {
    paddingTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchFab: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
