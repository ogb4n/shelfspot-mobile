import { useInventoryAlerts, useInventoryItems } from '@/stores/inventory';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AddToProjectModal } from '../../components/inventory/AddToProjectModal';
import { CreateAlertModal } from '../../components/inventory/CreateAlertModal';
import { EditItemModal } from '../../components/inventory/EditItemModal';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';
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
    const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);

    const { items, toggleFavorite, updateItem, deleteItem } = useInventoryItems();
    const {
        loadAlerts
    } = useInventoryAlerts();

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
                        The item you&apos;re looking for doesn&apos;t exist or has been deleted.
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

    const itemAlerts = item.activeAlerts || [];
    const hasAlerts = hasActiveAlerts(item);

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite(item.id);
            // Update local item state
            setItem(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        } catch {
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
                        } catch {
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

    const handleAddToProject = () => {
        setShowAddToProjectModal(true);
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
        } catch {
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
            {/* Custom Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol size={24} name="chevron.left" color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
                    {item?.name || 'Item Details'}
                </ThemedText>
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
                            name={item?.isFavorite ? "heart.fill" : "heart"}
                            size={20}
                            color={item?.isFavorite ? colors.error : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Item Header */}
                <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemTitleSection}>
                            <View style={styles.nameAndAlerts}>
                                <ThemedText type="title" style={[styles.itemName, { color: colors.text }]}>
                                    {item?.name || 'Unknown Item'}
                                </ThemedText>
                                {hasAlerts && (
                                    <View style={[styles.alertIndicator, { backgroundColor: colors.warning }]}>
                                        <IconSymbol name="exclamationmark" size={12} color="#FFFFFF" />
                                    </View>
                                )}
                            </View>
                            <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
                                📍 {item?.location || 'Unknown Location'}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.itemStats}>
                        <View style={styles.statItem}>
                            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Quantity
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.text }]}>
                                {item?.quantity || 0}
                            </ThemedText>
                        </View>

                        {(item?.importanceScore !== undefined && item?.importanceScore !== null) && (
                            <View style={styles.statItem}>
                                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    Importance
                                </ThemedText>
                                <View style={styles.importanceContainer}>
                                    <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.primary }]}>
                                        {item?.importanceScore}
                                    </ThemedText>
                                    <ThemedText style={[styles.importanceMax, { color: colors.textSecondary }]}>
                                        /10
                                    </ThemedText>
                                </View>
                            </View>
                        )}

                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item?.status || 'available')}20` }]}>
                            <ThemedText style={[styles.statusText, { color: getStatusColor(item?.status || 'available') }]}>
                                {getStatusText(item?.status || 'available')}
                            </ThemedText>
                        </View>
                    </View>

                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <ThemedText style={[styles.tagsTitle, { color: colors.textSecondary }]}>
                                🏷️ Tags
                            </ThemedText>
                            <View style={styles.tagsWrapper}>
                                {item.tags.map((tag) => (
                                    <View
                                        key={tag.id}
                                        style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                                    >
                                        <ThemedText style={[styles.tagText, { color: colors.primary }]}>
                                            {tag.name}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
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
                            onPress={handleAddToProject}
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

                {/* Location Details */}
                {(item.room || item.place || item.container) && (
                    <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
                        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                            📍 Location Details
                        </ThemedText>

                        <View style={styles.locationHierarchy}>
                            {item.room && (
                                <View style={styles.locationItem}>
                                    <View style={styles.locationHeader}>
                                        <View style={[styles.locationIcon, { backgroundColor: colors.primary }]}>
                                            <IconSymbol name="house" size={16} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.locationInfo}>
                                            <ThemedText style={[styles.locationLabel, { color: colors.textSecondary }]}>
                                                Room
                                            </ThemedText>
                                            <ThemedText style={[styles.locationValue, { color: colors.text }]}>
                                                {item.room.name}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {item.place && (
                                <View style={styles.locationItem}>
                                    <View style={styles.locationHeader}>
                                        <View style={[styles.locationIcon, { backgroundColor: colors.info }]}>
                                            <IconSymbol name="location" size={16} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.locationInfo}>
                                            <ThemedText style={[styles.locationLabel, { color: colors.textSecondary }]}>
                                                Place
                                            </ThemedText>
                                            <ThemedText style={[styles.locationValue, { color: colors.text }]}>
                                                {item.place.name}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {item.container && (
                                <View style={styles.locationItem}>
                                    <View style={styles.locationHeader}>
                                        <View style={[styles.locationIcon, { backgroundColor: colors.warning }]}>
                                            <IconSymbol name="shippingbox" size={16} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.locationInfo}>
                                            <ThemedText style={[styles.locationLabel, { color: colors.textSecondary }]}>
                                                Container
                                            </ThemedText>
                                            <ThemedText style={[styles.locationValue, { color: colors.text }]}>
                                                {item.container.name}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Financial Information */}
                {(item.price || item.sellprice) && (
                    <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
                        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                            💰 Financial Information
                        </ThemedText>

                        <View style={styles.detailsList}>
                            {item.price && (
                                <View style={styles.detailRow}>
                                    <View style={styles.detailWithIcon}>
                                        <IconSymbol name="dollarsign.circle" size={16} color={colors.success} />
                                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                            Purchase Price
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={[styles.detailValue, { color: colors.success }]}>
                                        €{item.price.toFixed(2)}
                                    </ThemedText>
                                </View>
                            )}

                            {item.sellprice && (
                                <View style={styles.detailRow}>
                                    <View style={styles.detailWithIcon}>
                                        <IconSymbol name="banknote" size={16} color={colors.info} />
                                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                            Sell Price
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={[styles.detailValue, { color: colors.info }]}>
                                        €{item.sellprice.toFixed(2)}
                                    </ThemedText>
                                </View>
                            )}

                            {item.price && item.sellprice && (
                                <View style={styles.detailRow}>
                                    <View style={styles.detailWithIcon}>
                                        <IconSymbol name="chart.line.uptrend.xyaxis" size={16} color={colors.primary} />
                                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                            Potential Profit
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={[styles.detailValue, { color: item.sellprice > item.price ? colors.success : colors.error }]}>
                                        €{(item.sellprice - item.price).toFixed(2)}
                                    </ThemedText>
                                </View>
                            )}

                            {item.price && (
                                <View style={styles.detailRow}>
                                    <View style={styles.detailWithIcon}>
                                        <IconSymbol name="sum" size={16} color={colors.warning} />
                                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                            Total Value
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                        €{(item.price * item.quantity).toFixed(2)}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Technical Details */}
                <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                        🔧 Technical Details
                    </ThemedText>

                    <View style={styles.detailsList}>
                        {(item.importanceScore !== undefined && item.importanceScore !== null) && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailWithIcon}>
                                    <IconSymbol name="star" size={16} color={colors.warning} />
                                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Importance Score
                                    </ThemedText>
                                </View>
                                <View style={styles.importanceContainer}>
                                    <ThemedText style={[styles.detailValue, { color: colors.warning }]}>
                                        {item.importanceScore}
                                    </ThemedText>
                                    <ThemedText style={[styles.importanceMax, { color: colors.textSecondary }]}>
                                        /10
                                    </ThemedText>
                                </View>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <View style={styles.detailWithIcon}>
                                <IconSymbol
                                    name={item.consumable ? "leaf" : "cube"}
                                    size={16}
                                    color={item.consumable ? colors.success : colors.info}
                                />
                                <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Type
                                </ThemedText>
                            </View>
                            <View style={[styles.typeBadge, { backgroundColor: item.consumable ? colors.success + '20' : colors.info + '20' }]}>
                                <ThemedText style={[styles.typeBadgeText, { color: item.consumable ? colors.success : colors.info }]}>
                                    {item.consumable ? '🔄 Consumable' : '📦 Durable'}
                                </ThemedText>
                            </View>
                        </View>

                        {item.importanceScore !== undefined && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailWithIcon}>
                                    <IconSymbol name="star" size={16} color={colors.warning} />
                                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Importance Score
                                    </ThemedText>
                                </View>
                                <View style={styles.importanceScoreContainer}>
                                    <View style={[styles.importanceScoreBadge, { backgroundColor: colors.warning + '20' }]}>
                                        <ThemedText style={[styles.importanceScoreText, { color: colors.warning }]}>
                                            ⭐ {item.importanceScore}/10
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        )}

                        {item.itemLink && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailWithIcon}>
                                    <IconSymbol name="link" size={16} color={colors.primary} />
                                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        External Link
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={async () => {
                                        try {
                                            if (item.itemLink) {
                                                const supported = await Linking.canOpenURL(item.itemLink);
                                                if (supported) {
                                                    await Linking.openURL(item.itemLink);
                                                } else {
                                                    Alert.alert('Error', 'Cannot open this link');
                                                }
                                            }
                                        } catch {
                                            Alert.alert('Error', 'Failed to open link');
                                        }
                                    }}
                                >
                                    <IconSymbol name="arrow.up.right.square" size={16} color={colors.primary} />
                                    <ThemedText style={[styles.linkText, { color: colors.primary }]}>
                                        Open Link
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {item.image && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailWithIcon}>
                                    <IconSymbol name="photo" size={16} color={colors.info} />
                                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Image
                                    </ThemedText>
                                </View>
                                <TouchableOpacity style={styles.linkButton}>
                                    <IconSymbol name="eye" size={16} color={colors.info} />
                                    <ThemedText style={[styles.linkText, { color: colors.info }]}>
                                        View Image
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Timeline */}
                <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                        📅 Timeline
                    </ThemedText>

                    <View style={styles.timelineContainer}>
                        {item.createdAt && (
                            <View style={styles.timelineItem}>
                                <View style={[styles.timelineIcon, { backgroundColor: colors.success }]}>
                                    <IconSymbol name="plus" size={12} color="#FFFFFF" />
                                </View>
                                <View style={styles.timelineContent}>
                                    <ThemedText style={[styles.timelineTitle, { color: colors.text }]}>
                                        Item Created
                                    </ThemedText>
                                    <ThemedText style={[styles.timelineDate, { color: colors.textSecondary }]}>
                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </ThemedText>
                                </View>
                            </View>
                        )}

                        {item.updatedAt && item.updatedAt !== item.createdAt && (
                            <View style={styles.timelineItem}>
                                <View style={[styles.timelineIcon, { backgroundColor: colors.info }]}>
                                    <IconSymbol name="pencil" size={12} color="#FFFFFF" />
                                </View>
                                <View style={styles.timelineContent}>
                                    <ThemedText style={[styles.timelineTitle, { color: colors.text }]}>
                                        Last Updated
                                    </ThemedText>
                                    <ThemedText style={[styles.timelineDate, { color: colors.textSecondary }]}>
                                        {new Date(item.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </ThemedText>
                                </View>
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
                            onPress={handleAddToProject}
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
                                                Alert when quantity is below {alert.threshold}
                                            </ThemedText>
                                            <ThemedText style={[styles.alertMeta, { color: colors.textSecondary }]}>
                                                Created {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Unknown'}
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

            <AddToProjectModal
                visible={showAddToProjectModal}
                onClose={() => setShowAddToProjectModal(false)}
                item={item}
                onItemAdded={() => setShowAddToProjectModal(false)}
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
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
        padding: 8,
        marginLeft: 8,
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
    importanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    importanceMax: {
        fontSize: 14,
        fontWeight: '400',
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
        marginTop: 16,
        gap: 8,
    },
    tagsTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    tagsWrapper: {
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
    locationCard: {
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
    locationHierarchy: {
        gap: 12,
    },
    locationItem: {
        borderLeftWidth: 3,
        borderLeftColor: '#E0E0E0',
        paddingLeft: 16,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    locationValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    detailWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
    },
    importanceScoreContainer: {
        alignItems: 'flex-end',
    },
    importanceScoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    importanceScoreText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timelineContainer: {
        gap: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    timelineIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    timelineDate: {
        fontSize: 12,
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
