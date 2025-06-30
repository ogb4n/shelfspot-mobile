import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

// Import refactored components and hooks
import { useInventoryAlerts, useInventoryFilters, useInventoryItems, useInventorySelection } from '@/stores/inventory';
import { AddItemModal } from '../../components/inventory/AddItemModal';
import { AddToProjectModal } from '../../components/inventory/AddToProjectModal';
import { AlertsModal } from '../../components/inventory/AlertsModal';
import { CreateAlertModal } from '../../components/inventory/CreateAlertModal';
import { EditAlertModal } from '../../components/inventory/EditAlertModal';
import { EditItemModal } from '../../components/inventory/EditItemModal';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryHeader } from '../../components/inventory/InventoryHeader';
import { InventoryItem } from '../../components/inventory/InventoryItem';
import { InventorySearch } from '../../components/inventory/InventorySearch';
import { ItemAlertsModal } from '../../components/inventory/ItemAlertsModal';
import { ItemContextMenu } from '../../components/inventory/ItemContextMenu';
import { ItemWithLocation } from '../../types/inventory';
import { hasActiveAdvancedFilters } from '../../utils/inventory/filters';

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Get navigation parameters
  const { filter } = useLocalSearchParams<{ filter?: string }>();

  // Show/hide advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Add item modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedItemForContext, setSelectedItemForContext] = useState<ItemWithLocation | null>(null);

  // Edit item modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<ItemWithLocation | null>(null);

  // Add to project modal
  const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);
  const [selectedItemForProject, setSelectedItemForProject] = useState<ItemWithLocation | null>(null);

  // Item alerts modal
  const [showItemAlertsModal, setShowItemAlertsModal] = useState(false);
  const [selectedItemForAlertsView, setSelectedItemForAlertsView] = useState<ItemWithLocation | null>(null);

  // Edit alert modal
  const [showEditAlertModal, setShowEditAlertModal] = useState(false);
  const [selectedAlertForEdit, setSelectedAlertForEdit] = useState<any>(null);

  // Use custom hooks
  const {
    items,
    filteredItems,
    loading,
    error,
    deleteItems,
    toggleFavorite,
    addItem,
    updateItem,
    deleteItem,
  } = useInventoryItems();

  const {
    searchQuery,
    selectedFilter,
    advancedFilters,
    setSearchQuery,
    setSelectedFilter,
    toggleAdvancedFilter,
    clearAllAdvancedFilters,
  } = useInventoryFilters();

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
    showCreateAlertModal,
    selectedItemForAlert,
    triggeredAlerts,
    openAlertsModal,
    closeAlertsModal,
    openCreateAlertModal,
    closeCreateAlertModal,
    createAlert,
    updateAlert,
    deleteAlert,
    loadAlerts,
  } = useInventoryAlerts();

  // Computed values
  const selectedItem = selectedItemForAlert 
    ? items.find(item => item.id === selectedItemForAlert)
    : null;

  // Load alerts when component mounts or when items change
  useEffect(() => {
    if (items.length > 0) {
      loadAlerts();
    }
  }, [items.length, loadAlerts]);

  // Update selectedItemForAlertsView when items change to keep it in sync
  const currentSelectedItem = useMemo(() => {
    if (selectedItemForAlertsView) {
      return items.find(item => item.id === selectedItemForAlertsView.id) || selectedItemForAlertsView;
    }
    return selectedItemForAlertsView;
  }, [items, selectedItemForAlertsView]);

  // Handle filter parameter from navigation
  useEffect(() => {
    if (filter && filter === 'consumables') {
      setSelectedFilter('consumables');
    }
  }, [filter, setSelectedFilter]);

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
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedItemsCount} item${selectedItemsCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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

  const handleCreateAlert = async (alertData: any) => {
    try {
      await createAlert(alertData, () => {
        Alert.alert('Success', 'Alert has been created!');
      });
    } catch {
      Alert.alert('Error', 'Failed to create alert');
    }
  };

  // Context menu handlers
  const handleItemLongPress = (item: ItemWithLocation, position: { x: number; y: number }) => {
    setSelectedItemForContext(item);
    setContextMenuPosition(position);
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
    setSelectedItemForContext(null);
  };

  const handleEditItem = (item: ItemWithLocation) => {
    setSelectedItemForEdit(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedItemForEdit(null);
  };

  const handleUpdateItem = async (itemId: number, updatedData: any) => {
    try {
      await updateItem(itemId, updatedData);
    } catch {
      Alert.alert('Error', 'Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = (itemId: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(itemId);
              Alert.alert('Success', 'Item has been deleted!');
            } catch {
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddToProject = (item: ItemWithLocation) => {
    setSelectedItemForProject(item);
    setShowAddToProjectModal(true);
  };

  const handleCloseAddToProjectModal = () => {
    setShowAddToProjectModal(false);
    setSelectedItemForProject(null);
  };

  const handleItemAddedToProject = () => {
    setShowAddToProjectModal(false);
    setSelectedItemForProject(null);
    Alert.alert('Success', 'Item has been added to the project!');
  };

  const handleViewItemAlerts = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedItemForAlertsView(item);
      setShowItemAlertsModal(true);
    }
  };

  const handleCloseItemAlertsModal = () => {
    setShowItemAlertsModal(false);
    setSelectedItemForAlertsView(null);
  };

  const handleCreateAlertFromItemAlerts = () => {
    if (selectedItemForAlertsView) {
      setShowItemAlertsModal(false);
      openCreateAlertModal(selectedItemForAlertsView.id);
    }
  };

  // Navigation handler for alert items
  const handleAlertItemPress = (itemId: number) => {
    closeAlertsModal();
    router.push(`/item/${itemId}`);
  };

  // Alert management handlers
  const handleEditAlert = (alert: any) => {
    setSelectedAlertForEdit(alert);
    setShowEditAlertModal(true);
    setShowItemAlertsModal(false);
  };

  const handleDeleteAlert = async (alertId: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlert(alertId);
              Alert.alert('Success', 'Alert has been deleted!');
            } catch {
              Alert.alert('Error', 'Failed to delete alert. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateAlert = async (alertData: any) => {
    if (!selectedAlertForEdit) return;

    try {
      await updateAlert(selectedAlertForEdit.id, alertData);
      setShowEditAlertModal(false);
      setSelectedAlertForEdit(null);
      Alert.alert('Success', 'Alert has been updated!');
    } catch {
      Alert.alert('Error', 'Failed to update alert. Please try again.');
    }
  };

  const handleCloseEditAlertModal = () => {
    setShowEditAlertModal(false);
    setSelectedAlertForEdit(null);
  };

  const handleItemPress = (item: ItemWithLocation) => {
    if (isSelectionMode) {
      handleItemSelection(item.id);
    } else {
      // Navigate to item detail page
      router.push(`/item/${item.id}`);
    }
  };

  const renderInventoryItem = ({ item }: { item: any }) => (
    <InventoryItem
      item={item}
      isSelected={isItemSelected(item.id)}
      isSelectionMode={isSelectionMode}
      onPress={() => handleItemPress(item)}
      onLongPress={handleItemLongPress}
      onToggleFavorite={toggleFavorite}
      onCreateAlert={openCreateAlertModal}
      onViewAlerts={handleViewItemAlerts}
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
        onToggleAdvancedFilter={toggleAdvancedFilter}
        onClearAdvancedFilters={clearAllAdvancedFilters}
      />

      {/* Inventory List */}
      {loading ? (
        <View style={[styles.list, { justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText style={{ color: colors.textSecondary }}>Loading inventory...</ThemedText>
        </View>
      ) : error ? (
        <View style={[styles.list, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
          <ThemedText style={{ color: colors.text, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
            Error Loading Inventory
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {error}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleOpenAddModal}
      >
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modals */}
      <AddItemModal
        visible={showAddModal}
        onClose={handleCloseAddModal}
        onAddItem={addItem}
      />

      <EditItemModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        onUpdateItem={handleUpdateItem}
        item={selectedItemForEdit}
      />

      <AlertsModal
        visible={showAlertsModal}
        onClose={closeAlertsModal}
        triggeredAlerts={triggeredAlerts}
        onItemPress={handleAlertItemPress}
      />

      <CreateAlertModal
        visible={showCreateAlertModal}
        onClose={closeCreateAlertModal}
        onCreateAlert={handleCreateAlert}
        itemId={selectedItemForAlert}
        itemName={selectedItem?.name}
      />

      <AddToProjectModal
        visible={showAddToProjectModal}
        item={selectedItemForProject}
        onClose={handleCloseAddToProjectModal}
        onItemAdded={handleItemAddedToProject}
      />

      <ItemAlertsModal
        visible={showItemAlertsModal}
        onClose={handleCloseItemAlertsModal}
        item={currentSelectedItem}
        onEditAlert={handleEditAlert}
        onDeleteAlert={handleDeleteAlert}
        onCreateAlert={handleCreateAlertFromItemAlerts}
      />

      <EditAlertModal
        visible={showEditAlertModal}
        onClose={handleCloseEditAlertModal}
        onUpdateAlert={handleUpdateAlert}
        alert={selectedAlertForEdit}
      />

      {/* Context Menu */}
      <ItemContextMenu
        visible={showContextMenu}
        onClose={handleCloseContextMenu}
        item={selectedItemForContext}
        position={contextMenuPosition}
        onEdit={handleEditItem}
        onToggleFavorite={toggleFavorite}
        onAddToProject={handleAddToProject}
        onDelete={handleDeleteItem}
      />
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
