import React, { useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

// Import refactored components and hooks
import { InventoryHeader } from '../../components/inventory/InventoryHeader';
import { InventorySearch } from '../../components/inventory/InventorySearch';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryItem } from '../../components/inventory/InventoryItem';
import { useInventoryItems } from '../../hooks/inventory/useInventoryItems';
import { useInventorySelection } from '../../hooks/inventory/useInventorySelection';
import { useInventoryAlerts } from '../../hooks/inventory/useInventoryAlerts';
import { hasActiveAdvancedFilters } from '../../utils/inventory/filters';

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Show/hide advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  // Use custom hooks
  const {
    items,
    filteredItems,
    searchQuery,
    selectedFilter,
    advancedFilters,
    setSearchQuery,
    setSelectedFilter,
    toggleAdvancedFilter,
    clearAllAdvancedFilters,
    deleteItems,
    toggleFavorite,
  } = useInventoryItems();

  const {
    isSelectionMode,
    selectedItems,
    selectedItemsCount,
    handleItemSelection,
    handleSelectAll: selectAllItems,
    toggleSelectionMode,
    exitSelectionMode,
    isItemSelected,
  } = useInventorySelection();

  const {
    showAlertsModal,
    triggeredAlerts,
    openAlertsModal,
    closeAlertsModal,
    openCreateAlertModal,
  } = useInventoryAlerts(items);

  // Handlers
  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${selectedItemsCount} objet${selectedItemsCount > 1 ? 's' : ''} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteItems(selectedItems);
            exitSelectionMode();
          },
        },
      ]
    );
  };

  const handleSelectAll = () => {
    selectAllItems(filteredItems.map(item => item.id));
  };

  const renderInventoryItem = ({ item }: { item: any }) => (
    <InventoryItem
      item={item}
      isSelected={isItemSelected(item.id)}
      isSelectionMode={isSelectionMode}
      onPress={() => isSelectionMode ? handleItemSelection(item.id) : undefined}
      onToggleFavorite={toggleFavorite}
      onCreateAlert={openCreateAlertModal}
    />
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <InventoryHeader
        isSelectionMode={isSelectionMode}
        selectedItemsCount={selectedItemsCount}
        totalTriggeredAlerts={triggeredAlerts.length}
        onToggleSelectionMode={toggleSelectionMode}
        onOpenAlertsModal={openAlertsModal}
        onOpenAddModal={handleOpenAddModal}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Search Bar */}
      <InventorySearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveAdvancedFilters(advancedFilters)}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
      />

      {/* Filters */}
      <InventoryFilters
        items={items}
        selectedFilter={selectedFilter}
        advancedFilters={advancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        onFilterSelect={setSelectedFilter}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        onToggleAdvancedFilter={toggleAdvancedFilter}
        onClearAdvancedFilters={clearAllAdvancedFilters}
      />

      {/* Inventory List */}
      <FlatList
        data={filteredItems}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleOpenAddModal}
      >
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* TODO: Add modals here */}
      {/* - AddItemModal */}
      {/* - AlertsModal */}
      {/* - CreateAlertModal */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
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
