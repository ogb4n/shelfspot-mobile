import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { CreateAlertModal } from '../../components/inventory/CreateAlertModal';
import { EditItemModal } from '../../components/inventory/EditItemModal';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';
import { useInventoryAlerts } from '../../hooks/inventory/useInventoryAlerts';
import { useInventoryItems } from '../../hooks/inventory/useInventoryItems';
import { useColorScheme } from '../../hooks/useColorScheme';
import { ItemWithLocation } from '../../types/inventory';
import { hasActiveAlerts } from '../../utils/inventory/alerts';
import { getStatusColor, getStatusText } from '../../utils/inventory/filters';

const { width: screenWidth } = Dimensions.get('window');

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [item, setItem] = useState<ItemWithLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);

    const { items, toggleFavorite, updateItem, deleteItem } = useInventoryItems();
    const {
        triggeredAlerts,
        createAlert,
        loadAlerts
    } = useInventoryAlerts(items);

    // Find the item by ID
    useEffect(() => {
        if (id && items.length > 0) {
            const foundItem = items.find(item => item.id.toString() === id);
            setItem(foundItem || null);
            setLoading(false);
        }
    }, [id, items]);

    // Load alerts for this item
    useEffect(() => {
        if (item) {
            loadAlerts();
        }
    }, [item, loadAlerts]);

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading item details...
                    </ThemedText>
                </View>
            </ThemedView>
        );
    }

    if (!item) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.errorContainer}>
                    <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
                    <ThemedText style={[styles.errorTitle, { color: colors.text }]}>
                        Item Not Found
                    </ThemedText>
                    <ThemedText style={[styles.errorDescription, { color: colors.textSecondary }]}>
                        The item you're looking for doesn't exist or has been deleted.
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    const itemAlerts = triggeredAlerts.filter(alert => alert.item.id === item.id);
    const hasAlerts = hasActiveAlerts(item);

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite(item.id);
            // Update local item state
            setItem(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        } catch (error) {
            Alert.alert('Error', 'Failed to update favorite status');
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteItem(item.id);
                            Alert.alert('Success', 'Item has been deleted!', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this item: ${item.name}\nLocation: ${item.location}\nQuantity: ${item.quantity}`,
                title: item.name,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCreateAlert = () => {
        setShowCreateAlertModal(true);
    };

    const handleUpdateItem = async (itemId: number, updatedData: any) => {
        try {
            await updateItem(itemId, updatedData);
            // Refresh item data
            const updatedItem = items.find(i => i.id === itemId);
            if (updatedItem) {
                setItem(updatedItem);
            }
            setShowEditModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update item');
        }
    };

    const handleAlertCreated = () => {
        setShowCreateAlertModal(false);
        loadAlerts(); // Refresh alerts
        Alert.alert('Success', 'Alert has been created!');
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: item.name,
                    headerShown: true,
                    headerBackTitle: '',
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={handleShare}
                            >
                                <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={handleToggleFavorite}
                            >
                                <IconSymbol
                                    name={item.isFavorite ? "heart.fill" : "heart"}
                                    size={20}
                                    color={item.isFavorite ? colors.error : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Item Header */}
                <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemTitleSection}>
                            <View style={styles.nameAndAlerts}>
                                <ThemedText type="title" style={[styles.itemName, { color: colors.text }]}>
                                    {item.name}
                                </ThemedText>
                                {hasAlerts && (
                                    <View style={[styles.alertIndicator, { backgroundColor: colors.warning }]}>
                                        <IconSymbol name="exclamationmark" size={12} color="#FFFFFF" />
                                    </View>
                                )}
                            </View>
                            <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
                                📍 {item.location}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.itemStats}>
                        <View style={styles.statItem}>
                            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Quantity
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.text }]}>
                                {item.quantity}
                            </ThemedText>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                {getStatusText(item.status)}
                            </ThemedText>
                        </View>
                    </View>

                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag) => (
                                <View
                                    key={tag.id}
                                    style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}
                                >
                                    <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>
                                        {tag.name}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                        Quick Actions
                    </ThemedText>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={handleEdit}
                        >
                            <IconSymbol name="pencil" size={20} color="#FFFFFF" />
                            <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                                Edit Item
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.warning }]}
                            onPress={handleCreateAlert}
                        >
                            <IconSymbol name="bell.badge" size={20} color="#FFFFFF" />
                            <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                                Create Alert
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.info }]}
                            onPress={() => Alert.alert('Add to Project', 'This feature will be available soon!')}
                        >
                            <IconSymbol name="folder.badge.plus" size={20} color="#FFFFFF" />
                            <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                                Add to Project
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.error }]}
                            onPress={handleDelete}
                        >
                            <IconSymbol name="trash" size={20} color="#FFFFFF" />
                            <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                                Delete Item
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Item Details */}
                <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                        Item Details
                    </ThemedText>

                    <View style={styles.detailsList}>
                        {item.price && (
                            <View style={styles.detailRow}>
                                <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Purchase Price
                                </ThemedText>
                                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                    €{item.price.toFixed(2)}
                                </ThemedText>
                            </View>
                        )}

                        {item.sellprice && (
                            <View style={styles.detailRow}>
                                <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Sell Price
                                </ThemedText>
                                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                    €{item.sellprice.toFixed(2)}
                                </ThemedText>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Type
                            </ThemedText>
                            <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                {item.consumable ? 'Consumable' : 'Non-consumable'}
                            </ThemedText>
                        </View>

                        {item.itemLink && (
                            <View style={styles.detailRow}>
                                <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    External Link
                                </ThemedText>
                                <TouchableOpacity>
                                    <ThemedText style={[styles.linkText, { color: colors.primary }]}>
                                        View Link
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {item.createdAt && (
                            <View style={styles.detailRow}>
                                <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Added
                                </ThemedText>
                                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </ThemedText>
                            </View>
                        )}

                        {item.updatedAt && (
                            <View style={styles.detailRow}>
                                <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Last Updated
                                </ThemedText>
                                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                    {new Date(item.updatedAt).toLocaleDateString()}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Projects Section (Placeholder) */}
                <View style={[styles.projectsCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                        Projects
                    </ThemedText>
                    <View style={styles.emptyState}>
                        <IconSymbol name="folder" size={32} color={colors.textSecondary} />
                        <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            This item is not part of any projects yet
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={() => Alert.alert('Add to Project', 'Project management will be available soon!')}
                        >
                            <ThemedText style={[styles.emptyButtonText, { color: colors.primary }]}>
                                Add to Project
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Alerts Section */}
                <View style={[styles.alertsCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                        Alerts ({itemAlerts.length})
                    </ThemedText>

                    {itemAlerts.length > 0 ? (
                        <View style={styles.alertsList}>
                            {itemAlerts.map((alert, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.alertItem,
                                        { backgroundColor: colors.backgroundSecondary },
                                        index < itemAlerts.length - 1 && { marginBottom: 12 }
                                    ]}
                                >
                                    <View style={styles.alertContent}>
                                        <View style={[styles.alertTypeIndicator, { backgroundColor: colors.warning }]}>
                                            <IconSymbol name="bell" size={16} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.alertInfo}>
                                            <ThemedText style={[styles.alertTitle, { color: colors.text }]}>
                                                Low Stock Alert
                                            </ThemedText>
                                            <ThemedText style={[styles.alertDescription, { color: colors.textSecondary }]}>
                                                Alert when quantity is below {alert.alert.threshold}
                                            </ThemedText>
                                            <ThemedText style={[styles.alertMeta, { color: colors.textSecondary }]}>
                                                Created {alert.alert.createdAt ? new Date(alert.alert.createdAt).toLocaleDateString() : 'Unknown'}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <IconSymbol name="bell" size={32} color={colors.textSecondary} />
                            <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                No alerts configured for this item
                            </ThemedText>
                            <TouchableOpacity
                                style={[styles.emptyButton, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={handleCreateAlert}
                            >
                                <ThemedText style={[styles.emptyButtonText, { color: colors.primary }]}>
                                    Create Alert
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modals */}
            <EditItemModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                onUpdateItem={handleUpdateItem}
                item={item}
            />

            <CreateAlertModal
                visible={showCreateAlertModal}
                onClose={() => setShowCreateAlertModal(false)}
                onCreateAlert={handleAlertCreated}
                itemId={item.id}
                itemName={item.name}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
    },
    headerCard: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    itemHeader: {
        marginBottom: 16,
    },
    itemTitleSection: {
        flex: 1,
    },
    nameAndAlerts: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    itemName: {
        fontSize: 24,
    },
    alertIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemLocation: {
        fontSize: 16,
    },
    itemStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actionsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        minWidth: (screenWidth - 64) / 2 - 6,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    detailsList: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkText: {
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    projectsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    alertsCard: {
        marginHorizontal: 16,
        marginBottom: 32,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    alertsList: {
        gap: 12,
    },
    alertItem: {
        padding: 16,
        borderRadius: 12,
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    alertTypeIndicator: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertInfo: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    alertDescription: {
        fontSize: 12,
        marginBottom: 2,
    },
    alertMeta: {
        fontSize: 10,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyStateText: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    emptyButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
