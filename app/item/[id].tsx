import { useInventoryAlerts, useInventoryItems } from '@/stores/inventory';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddToProjectModal } from '../../components/inventory/AddToProjectModal';
import { AlertContextMenu } from '../../components/inventory/AlertContextMenu';
import { CreateAlertModal } from '../../components/inventory/CreateAlertModal';
import { EditAlertModal } from '../../components/inventory/EditAlertModal';
import { EditItemModal } from '../../components/inventory/EditItemModal';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Colors } from '../../constants/Colors';
import { useToast } from '../../contexts/ToastContext';
import { useColorScheme } from '../../hooks/useColorScheme';
import { AlertFormData, ItemWithLocation } from '../../types/inventory';
import { hasActiveAlerts } from '../../utils/inventory/alerts';
import { getStatusColor, getStatusText } from '../../utils/inventory/filters';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { showSuccess, showError } = useToast();

    const [item, setItem] = useState<ItemWithLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
    const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);
    const [showEditAlertModal, setShowEditAlertModal] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<any>(null);
    const [showAlertContextMenu, setShowAlertContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    const { items, toggleFavorite, updateItem, deleteItem } = useInventoryItems();
    const {
        allAlerts,
        createAlert,
        updateAlert,
        deleteAlert
    } = useInventoryAlerts();

    // Find the item by ID
    useEffect(() => {
        if (id && items.length > 0) {
            const foundItem = items.find(item => item.id.toString() === id);
            setItem(foundItem || null);
            setLoading(false);
        }
    }, [id, items]);

    // Alerts are loaded globally in the store initialization, no need to reload here

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

    const itemAlerts = allAlerts.filter(alert => alert.itemId === item.id);
    const hasAlerts = hasActiveAlerts(item);

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite(item.id);
            // No need to manually update local state - the store will update and trigger a re-render
        } catch {
            showError('Failed to update favorite status');
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        try {
            await deleteItem(item.id);
            showSuccess('Item has been deleted!');
            router.back();
        } catch {
            showError('Failed to delete item');
        }
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
            // Update the item in the store
            await updateItem(itemId, updatedData);
            setShowEditModal(false);
            
            // The useEffect will automatically update the local item state when the store updates
        } catch {
            showError('Failed to update item');
        }
    };

    const handleAlertCreated = async (alertData: AlertFormData) => {
        try {
            await createAlert(alertData, () => {
                setShowCreateAlertModal(false);
                showSuccess('Alert has been created!');
            });
        } catch {
            showError('Failed to create alert');
        }
    };

    const handleAlertContextMenu = (alert: any, event: any) => {
        setSelectedAlert(alert);
        setContextMenuPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
        setShowAlertContextMenu(true);
    };

    const handleEditAlert = (alert: any) => {
        setSelectedAlert(alert);
        setShowEditAlertModal(true);
        setShowAlertContextMenu(false);
    };

    const handleDeleteAlert = async (alertId: number) => {
        try {
            await deleteAlert(alertId);
            showSuccess('Alert has been deleted!');
        } catch {
            showError('Failed to delete alert');
        }
        setShowAlertContextMenu(false);
    };

    const handleToggleAlertStatus = async (alertId: number, currentStatus: boolean) => {
        try {
            await updateAlert(alertId, { isActive: !currentStatus });
            showSuccess(`Alert has been ${!currentStatus ? 'enabled' : 'disabled'}!`);
        } catch {
            showError('Failed to update alert status');
        }
        setShowAlertContextMenu(false);
    };

    const handleUpdateAlert = async (alertData: Omit<AlertFormData, 'itemId'>) => {
        if (!selectedAlert) return;
        
        try {
            await updateAlert(selectedAlert.id, alertData);
            setShowEditAlertModal(false);
            setSelectedAlert(null);
            showSuccess('Alert has been updated!');
        } catch {
            showError('Failed to update alert');
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Modern Header */}
            <View style={[styles.header, { 
                backgroundColor: colors.background, 
                borderBottomColor: colors.border,
                paddingTop: insets.top + 12
            }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={[styles.headerBackButton, { backgroundColor: colors.backgroundSecondary }]}
                        activeOpacity={0.7}
                    >
                        <IconSymbol size={20} name="chevron.left" color={colors.text} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.headerCenter}>
                    <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: colors.text }]}>
                        Item Details
                    </ThemedText>
                    {item && (
                        <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {item.name}
                        </ThemedText>
                    )}
                </View>
                
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.headerActionButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={handleShare}
                        activeOpacity={0.7}
                    >
                        <IconSymbol name="square.and.arrow.up" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerActionButton, { 
                            backgroundColor: item?.isFavorite ? colors.error + '20' : colors.backgroundSecondary 
                        }]}
                        onPress={handleToggleFavorite}
                        activeOpacity={0.7}
                    >
                        <IconSymbol
                            name={item?.isFavorite ? "heart.fill" : "heart"}
                            size={18}
                            color={item?.isFavorite ? colors.error : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Modern Item Header */}
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
                            <View style={styles.locationRow}>
                                <View style={[styles.locationPin, { backgroundColor: colors.primary + '20' }]}>
                                    <IconSymbol name="location" size={14} color={colors.primary} />
                                </View>
                                <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
                                    {item?.location || 'Unknown Location'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.itemStatsContainer}>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
                                <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
                                    <IconSymbol name="cube" size={16} color={colors.info} />
                                </View>
                                <View style={styles.statContent}>
                                    <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                                        Quantity
                                    </ThemedText>
                                    <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.text }]}>
                                        {item?.quantity || 0}
                                    </ThemedText>
                                </View>
                            </View>

                            {(item?.importanceScore !== undefined && item?.importanceScore !== null) && (
                                <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
                                    <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
                                        <IconSymbol name="star" size={16} color={colors.warning} />
                                    </View>
                                    <View style={styles.statContent}>
                                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                                            Importance
                                        </ThemedText>
                                        <View style={styles.importanceContainer}>
                                            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.warning }]}>
                                                {item?.importanceScore}
                                            </ThemedText>
                                            <ThemedText style={[styles.importanceMax, { color: colors.textSecondary }]}>
                                                /10
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={[styles.statusBadgeContainer, { backgroundColor: `${getStatusColor(item?.status || 'available')}15` }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item?.status || 'available') }]} />
                            <ThemedText style={[styles.statusText, { color: getStatusColor(item?.status || 'available') }]}>
                                {getStatusText(item?.status || 'available')}
                            </ThemedText>
                        </View>
                    </View>

                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <View style={styles.tagsHeader}>
                                <View style={[styles.tagsIcon, { backgroundColor: colors.primary + '20' }]}>
                                    <IconSymbol name="tag" size={14} color={colors.primary} />
                                </View>
                                <ThemedText style={[styles.tagsTitle, { color: colors.textSecondary }]}>
                                    Tags
                                </ThemedText>
                            </View>
                            <View style={styles.tagsWrapper}>
                                {item.tags.map((tag) => (
                                    <View
                                        key={tag.id}
                                        style={[styles.modernTag, { 
                                            backgroundColor: colors.primary + '15',
                                            borderColor: colors.primary + '30'
                                        }]}
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
                        ⚡ Quick Actions
                    </ThemedText>
                    <View style={styles.actionsContainer}>
                        {/* First Row */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryAction, { backgroundColor: colors.primary }]}
                                onPress={handleEdit}
                                activeOpacity={0.8}
                            >
                                <View style={styles.actionIconContainer}>
                                    <IconSymbol name="pencil" size={22} color="#FFFFFF" />
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <ThemedText style={styles.actionButtonTitle}>Edit Item</ThemedText>
                                    <ThemedText style={styles.actionButtonSubtitle}>Modify details</ThemedText>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryAction, { backgroundColor: colors.warning }]}
                                onPress={handleCreateAlert}
                                activeOpacity={0.8}
                            >
                                <View style={styles.actionIconContainer}>
                                    <IconSymbol name="bell.badge" size={22} color="#FFFFFF" />
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <ThemedText style={styles.actionButtonTitle}>Alert</ThemedText>
                                    <ThemedText style={styles.actionButtonSubtitle}>Set threshold</ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Second Row */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryAction, { backgroundColor: colors.info }]}
                                onPress={handleAddToProject}
                                activeOpacity={0.8}
                            >
                                <View style={styles.actionIconContainer}>
                                    <IconSymbol name="folder.badge.plus" size={22} color="#FFFFFF" />
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <ThemedText style={styles.actionButtonTitle}>Project</ThemedText>
                                    <ThemedText style={styles.actionButtonSubtitle}>Add to project</ThemedText>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.dangerAction, { backgroundColor: colors.error }]}
                                onPress={handleDelete}
                                activeOpacity={0.8}
                            >
                                <View style={styles.actionIconContainer}>
                                    <IconSymbol name="trash" size={22} color="#FFFFFF" />
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <ThemedText style={styles.actionButtonTitle}>Delete</ThemedText>
                                    <ThemedText style={styles.actionButtonSubtitle}>Remove item</ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>
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
                                                    showError('Cannot open this link');
                                                }
                                            }
                                        } catch {
                                            showError('Failed to open link');
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                            Alerts ({itemAlerts.length})
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                            onPress={handleCreateAlert}
                        >
                            <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
                                Add Alert
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {itemAlerts.length > 0 ? (
                        <View style={styles.alertsList}>
                            {itemAlerts.map((alert, index) => (
                                <TouchableOpacity
                                    key={alert.id || index}
                                    style={[
                                        styles.alertItem,
                                        { backgroundColor: colors.backgroundSecondary },
                                        index < itemAlerts.length - 1 && { marginBottom: 12 }
                                    ]}
                                    onLongPress={(event) => handleAlertContextMenu(alert, event)}
                                >
                                    <View style={styles.alertContent}>
                                        <View style={[
                                            styles.alertTypeIndicator, 
                                            { backgroundColor: alert.isActive ? colors.warning : colors.textSecondary }
                                        ]}>
                                            <IconSymbol name={alert.isActive ? "bell" : "bell.slash"} size={16} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.alertInfo}>
                                            <ThemedText style={[styles.alertTitle, { color: colors.text }]}>
                                                {alert.name || 'Low Stock Alert'}
                                            </ThemedText>
                                            <ThemedText style={[styles.alertDescription, { color: colors.textSecondary }]}>
                                                Alert when quantity is below {alert.threshold}
                                            </ThemedText>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <ThemedText style={[styles.alertMeta, { color: colors.textSecondary }]}>
                                                    Created {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Unknown'}
                                                </ThemedText>
                                                <View style={[
                                                    styles.emptyButton, 
                                                    { backgroundColor: alert.isActive ? colors.success + '20' : colors.error + '20' }
                                                ]}>
                                                    <ThemedText style={[
                                                        styles.emptyButtonText, 
                                                        { color: alert.isActive ? colors.success : colors.error }
                                                    ]}>
                                                        {alert.isActive ? 'Active' : 'Inactive'}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
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

            <EditAlertModal
                visible={showEditAlertModal}
                onClose={() => {
                    setShowEditAlertModal(false);
                    setSelectedAlert(null);
                }}
                onUpdateAlert={handleUpdateAlert}
                alert={selectedAlert}
            />

            <AlertContextMenu
                visible={showAlertContextMenu}
                onClose={() => setShowAlertContextMenu(false)}
                alert={selectedAlert}
                position={contextMenuPosition}
                onEdit={handleEditAlert}
                onToggleActive={handleToggleAlertStatus}
                onViewItem={(itemId) => {
                    // Already on the item page
                    setShowAlertContextMenu(false);
                }}
                onDelete={handleDeleteAlert}
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
        borderBottomWidth: 1,
    },
    headerLeft: {
        minWidth: 80,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    headerRight: {
        minWidth: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerActionButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
        textAlign: 'center',
        opacity: 0.8,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    headerCard: {
        margin: 16,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    itemHeader: {
        marginBottom: 20,
    },
    itemTitleSection: {
        flex: 1,
    },
    nameAndAlerts: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    itemName: {
        fontSize: 26,
        fontWeight: '700',
    },
    alertIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationPin: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemLocation: {
        fontSize: 16,
        fontWeight: '500',
        paddingRight: 8,
    },
    itemStatsContainer: {
        gap: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 12,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statItem: {
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    importanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    importanceMax: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7,
    },
    statusBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
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
        marginTop: 20,
        gap: 12,
    },
    tagsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagsIcon: {
        width: 20,
        height: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagsTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modernTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    locationCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
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
        gap: 20,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    timelineIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timelineContent: {
        flex: 1,
        paddingTop: 2,
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 13,
        opacity: 0.7,
    },
    actionsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    actionsContainer: {
        gap: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryAction: {
        // Additional styling for primary actions
    },
    secondaryAction: {
        // Additional styling for secondary actions
    },
    dangerAction: {
        // Additional styling for danger actions
    },
    actionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionButtonTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    actionButtonSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        lineHeight: 16,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
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
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    alertsCard: {
        marginHorizontal: 16,
        marginBottom: 32,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
