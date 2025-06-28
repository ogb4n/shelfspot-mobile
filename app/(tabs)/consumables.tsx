import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

// Import components
import { AddItemModal } from '../../components/inventory/AddItemModal';
import { EditItemModal } from '../../components/inventory/EditItemModal';
import { InventoryItem } from '../../components/inventory/InventoryItem';
import { InventorySearch } from '../../components/inventory/InventorySearch';
import { useInventoryItems } from '../../hooks/inventory/useInventoryItems';
import { ItemWithLocation } from '../../types/inventory';

export default function ConsumablesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // Add item modal
    const [showAddModal, setShowAddModal] = useState(false);

    // Edit item modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState<ItemWithLocation | null>(null);

    // Use inventory items hook but filter for consumables
    const {
        items,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        deleteItem,
        toggleFavorite,
        addItem,
        updateItem,
    } = useInventoryItems();

    // Filter for consumable items only
    const consumableItems = items.filter(item => item.consumable);

    // Apply search filter to consumables
    const filteredConsumables = consumableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.room?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.place?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Low stock threshold for consumables (usually higher than regular items)
    const lowStockThreshold = 10;
    const lowStockItems = consumableItems.filter(item => item.quantity <= lowStockThreshold);

    // Handlers
    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
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
        } catch (error) {
            Alert.alert('Error', 'Failed to update item. Please try again.');
        }
    };

    const handleDeleteItem = (itemId: number) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this consumable item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteItem(itemId);
                            Alert.alert('Success', 'Consumable item has been deleted!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleItemPress = (item: ItemWithLocation) => {
        // Navigate to item detail page
        router.push(`/item/${item.id}`);
    };

    const handleAddConsumableItem = async (itemData: any) => {
        // Ensure the item is marked as consumable
        const consumableData = { ...itemData, consumable: true };
        try {
            await addItem(consumableData);
            Alert.alert('Success', 'Consumable item has been added!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add consumable item. Please try again.');
        }
    };

    const renderConsumableItem = ({ item }: { item: any }) => (
        <InventoryItem
            item={item}
            isSelected={false}
            isSelectionMode={false}
            onPress={() => handleItemPress(item)}
            onLongPress={() => { }}
            onToggleFavorite={toggleFavorite}
            onCreateAlert={() => { }}
        />
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title" style={[styles.title, styles.titleText, { color: colors.text }]}>
                    Consumables
                </ThemedText>
                <View style={styles.headerButtons}>
                    {lowStockItems.length > 0 && (
                        <View style={[styles.lowStockBadge, { backgroundColor: colors.warning }]}>
                            <ThemedText style={styles.lowStockText}>
                                {lowStockItems.length} Low Stock
                            </ThemedText>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={handleOpenAddModal}
                    >
                        <IconSymbol name="plus" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <InventorySearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showAdvancedFilters={false}
                hasActiveFilters={false}
                onToggleAdvancedFilters={() => { }}
            />

            {/* Stats */}
            <View style={styles.stats}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <IconSymbol name="cube.box.fill" size={20} color={colors.primary} />
                    <View style={styles.statInfo}>
                        <ThemedText style={[styles.statNumber, { color: colors.text }]}>
                            {consumableItems.length}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Total Consumables
                        </ThemedText>
                    </View>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
                    <View style={styles.statInfo}>
                        <ThemedText style={[styles.statNumber, { color: colors.text }]}>
                            {lowStockItems.length}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Low Stock
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* Consumables List */}
            {loading ? (
                <View style={[styles.list, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ThemedText style={{ color: colors.textSecondary }}>Loading consumables...</ThemedText>
                </View>
            ) : error ? (
                <View style={[styles.list, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                    <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
                    <ThemedText style={{ color: colors.text, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
                        Error Loading Consumables
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>
                        {error}
                    </ThemedText>
                </View>
            ) : filteredConsumables.length === 0 ? (
                <View style={[styles.list, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                    <IconSymbol name="cube.box" size={48} color={colors.textSecondary} />
                    <ThemedText style={{ color: colors.text, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
                        No Consumables Found
                    </ThemedText>
                    <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>
                        {searchQuery ? 'Try adjusting your search terms.' : 'Add your first consumable item to get started.'}
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredConsumables}
                    renderItem={renderConsumableItem}
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
                onAddItem={handleAddConsumableItem}
            />

            <EditItemModal
                visible={showEditModal}
                onClose={handleCloseEditModal}
                onUpdateItem={handleUpdateItem}
                item={selectedItemForEdit}
            />
        </ThemedView>
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
        paddingTop: 60,
        paddingBottom: 16,
    },
    title: {
        flex: 1,
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    lowStockBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    lowStockText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stats: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    statInfo: {
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
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
