import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { backendApi } from '@/services/backend-api';
import { ItemWithLocation } from '@/types/inventory';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddItemToProjectModalProps {
    visible: boolean;
    projectId: number;
    projectName: string;
    onClose: () => void;
    onItemAdded: () => void;
}

export function AddItemToProjectModal({
    visible,
    projectId,
    projectName,
    onClose,
    onItemAdded,
}: AddItemToProjectModalProps) {
    const [items, setItems] = useState<ItemWithLocation[]>([]);
    const [filteredItems, setFilteredItems] = useState<ItemWithLocation[]>([]);
    const [selectedItem, setSelectedItem] = useState<ItemWithLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    const colors = {
        card: useThemeColor({}, 'card'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        primary: useThemeColor({}, 'primary'),
        backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
        background: useThemeColor({}, 'background'),
        border: useThemeColor({}, 'border'),
    };

    useEffect(() => {
        if (visible) {
            loadItems();
            // Reset form
            setSelectedItem(null);
            setSearchQuery('');
            setQuantity(1);
            setIsActive(true);
        }
    }, [visible]);

    useEffect(() => {
        // Filter items based on search query
        if (searchQuery.trim() === '') {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [items, searchQuery]);

    const loadItems = async () => {
        try {
            setLoadingItems(true);
            const itemsData = await backendApi.getItems();
            // Transform and filter available items only
            const availableItems = itemsData.filter((item: any) => item.quantity > 0);
            setItems(availableItems);
        } catch (error) {
            console.error('Error loading items:', error);
            Alert.alert('Error', 'Failed to load items');
        } finally {
            setLoadingItems(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedItem) return;

        try {
            setLoading(true);
            await backendApi.addItemToProject(projectId, {
                itemId: selectedItem.id,
                quantity,
                isActive,
            });

            onItemAdded();
            Alert.alert('Success', `Item "${selectedItem.name}" added to project`);
        } catch (error: any) {
            console.error('Error adding item to project:', error);
            Alert.alert('Error', error.message || 'Failed to add item to project');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedItem(null);
        setSearchQuery('');
        setQuantity(1);
        setIsActive(true);
        onClose();
    };

    const handleItemSelect = (item: ItemWithLocation) => {
        setSelectedItem(item);
        setQuantity(Math.min(1, item.quantity)); // Start with 1 or max available
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <ThemedView style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.backgroundSecondary }]}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.text }]}>
                        Add Item to {projectName}
                    </ThemedText>
                    <View style={styles.headerSpace} />
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        {/* Search */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Search Items
                            </ThemedText>
                            <TextInput
                                style={[styles.searchInput, {
                                    backgroundColor: colors.backgroundSecondary,
                                    color: colors.text,
                                    borderColor: colors.border,
                                }]}
                                placeholder="Search for items..."
                                placeholderTextColor={colors.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Selected Item */}
                        {selectedItem && (
                            <View style={[styles.selectedItemCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                                <View style={styles.selectedItemInfo}>
                                    <ThemedText type="defaultSemiBold" style={[styles.selectedItemName, { color: colors.text }]}>
                                        Selected: {selectedItem.name}
                                    </ThemedText>
                                    <ThemedText style={[styles.selectedItemQuantity, { color: colors.textSecondary }]}>
                                        Available: {selectedItem.quantity}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setSelectedItem(null)}
                                    style={styles.removeButton}
                                >
                                    <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Items List */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Available Items
                            </ThemedText>

                            {loadingItems ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        Loading items...
                                    </ThemedText>
                                </View>
                            ) : filteredItems.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                                        {searchQuery ? 'No items found' : 'No items available'}
                                    </ThemedText>
                                </View>
                            ) : (
                                <View style={styles.itemsList}>
                                    {filteredItems.slice(0, 10).map((item) => ( // Limit to first 10 items for performance
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[
                                                styles.itemRow,
                                                {
                                                    backgroundColor: selectedItem?.id === item.id
                                                        ? colors.primary + '20'
                                                        : colors.backgroundSecondary,
                                                    borderColor: selectedItem?.id === item.id
                                                        ? colors.primary
                                                        : colors.border,
                                                }
                                            ]}
                                            onPress={() => handleItemSelect(item)}
                                        >
                                            <View style={styles.itemInfo}>
                                                <ThemedText
                                                    type="defaultSemiBold"
                                                    style={[
                                                        styles.itemName,
                                                        {
                                                            color: selectedItem?.id === item.id
                                                                ? colors.primary
                                                                : colors.text
                                                        }
                                                    ]}
                                                >
                                                    {item.name}
                                                </ThemedText>
                                                <ThemedText
                                                    style={[styles.itemQuantity, { color: colors.textSecondary }]}
                                                >
                                                    Qty: {item.quantity}
                                                </ThemedText>
                                            </View>
                                            {selectedItem?.id === item.id && (
                                                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                    {filteredItems.length > 10 && (
                                        <View style={styles.moreItemsHint}>
                                            <ThemedText style={[styles.moreItemsText, { color: colors.textSecondary }]}>
                                                +{filteredItems.length - 10} more items. Use search to find specific items.
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Quantity */}
                        {selectedItem && (
                            <View style={styles.section}>
                                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                    Quantity
                                </ThemedText>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <IconSymbol name="minus" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.quantityInput, {
                                            backgroundColor: colors.backgroundSecondary,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        }]}
                                        value={quantity.toString()}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 1;
                                            setQuantity(Math.max(1, Math.min(num, selectedItem.quantity)));
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                                        onPress={() => setQuantity(Math.min(selectedItem.quantity, quantity + 1))}
                                    >
                                        <IconSymbol name="plus" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Active Status */}
                        {selectedItem && (
                            <View style={styles.section}>
                                <TouchableOpacity
                                    style={styles.activeToggle}
                                    onPress={() => setIsActive(!isActive)}
                                >
                                    <IconSymbol
                                        name={isActive ? "checkmark.square" : "square"}
                                        size={24}
                                        color={isActive ? colors.primary : colors.textSecondary}
                                    />
                                    <View style={styles.activeToggleText}>
                                        <ThemedText type="defaultSemiBold" style={[styles.activeLabel, { color: colors.text }]}>
                                            Active in Project
                                        </ThemedText>
                                        <ThemedText style={[styles.activeDescription, { color: colors.textSecondary }]}>
                                            Whether this item is currently being used in the project
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: colors.backgroundSecondary }]}>
                    <View style={styles.footerButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton, { borderColor: colors.textSecondary }]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.primaryButton,
                                {
                                    backgroundColor: (selectedItem && !loading) ? colors.primary : colors.backgroundSecondary,
                                }
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedItem || loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText style={[
                                    styles.primaryButtonText,
                                    { color: selectedItem ? 'white' : colors.textSecondary }
                                ]}>
                                    Add to Project
                                </ThemedText>
                            )}
                        </TouchableOpacity>
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
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    headerSpace: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
    },
    searchInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    selectedItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    selectedItemInfo: {
        flex: 1,
        gap: 4,
    },
    selectedItemName: {
        fontSize: 16,
    },
    selectedItemQuantity: {
        fontSize: 14,
    },
    removeButton: {
        padding: 4,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    itemsList: {
        gap: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    itemInfo: {
        flex: 1,
        gap: 4,
    },
    itemName: {
        fontSize: 16,
    },
    itemQuantity: {
        fontSize: 14,
    },
    moreItemsHint: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    moreItemsText: {
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
        textAlign: 'center',
        minWidth: 80,
        borderWidth: 1,
    },
    activeToggle: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    activeToggleText: {
        flex: 1,
        gap: 4,
    },
    activeLabel: {
        fontSize: 16,
    },
    activeDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    primaryButton: {
        flex: 1,
    },
    secondaryButton: {
        borderWidth: 1,
        flex: 0.4,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
