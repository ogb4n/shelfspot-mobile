import { CreateItemModal, EditItemModal, ManageSection, StatsCard } from '@/components/manage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { backendApi } from '@/services/backend-api';
import { useInventoryStore } from '@/stores/inventory';
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EntityType = 'rooms' | 'places' | 'containers' | 'tags';

interface ManageItem {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    roomId?: number;
    placeId?: number;
    room?: { id: number; name: string };
    place?: { id: number; name: string };
}

export default function ManageScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('rooms');
    const [selectedItem, setSelectedItem] = useState<ManageItem | null>(null);

    // Data state
    const [rooms, setRooms] = useState<ManageItem[]>([]);
    const [places, setPlaces] = useState<ManageItem[]>([]);
    const [containers, setContainers] = useState<ManageItem[]>([]);
    const [tags, setTags] = useState<ManageItem[]>([]);

    // Get data from inventory store
    const { loadInventoryData } = useInventoryStore();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [roomsData, placesData, containersData, tagsData] = await Promise.all([
                backendApi.getRooms(),
                backendApi.getPlaces(),
                backendApi.getContainers(),
                backendApi.getTags(),
            ]);

            setRooms(roomsData);
            setPlaces(placesData);
            setContainers(containersData);
            setTags(tagsData);
        } catch (error) {
            console.error('Error loading management data:', error);
            Alert.alert('Error', 'Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        // Also refresh inventory store data
        await loadInventoryData();
        setRefreshing(false);
    };

    const handleCreate = (entityType: EntityType) => {
        setSelectedEntityType(entityType);
        setSelectedItem(null);
        setShowCreateModal(true);
    };

    const handleEdit = (entityType: EntityType, item: ManageItem) => {
        setSelectedEntityType(entityType);
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = async (entityType: EntityType, item: ManageItem) => {
        const entityName = entityType.slice(0, -1); // Remove 's' from plural
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone and may affect existing items that reference this ${entityName}.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);

                            switch (entityType) {
                                case 'rooms':
                                    await backendApi.deleteRoom(item.id);
                                    break;
                                case 'places':
                                    await backendApi.deletePlace(item.id);
                                    break;
                                case 'containers':
                                    await backendApi.deleteContainer(item.id);
                                    break;
                                case 'tags':
                                    await backendApi.deleteTag(item.id);
                                    break;
                            }

                            await loadData();
                            await loadInventoryData(); // Refresh inventory store
                            Alert.alert('Success', `${item.name} has been deleted successfully.`);
                        } catch (error: any) {
                            console.error('Error deleting item:', error);
                            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete item';
                            Alert.alert('Error', errorMessage);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCreateSuccess = async () => {
        setShowCreateModal(false);
        await loadData();
        await loadInventoryData(); // Refresh inventory store
    };

    const handleEditSuccess = async () => {
        setShowEditModal(false);
        await loadData();
        await loadInventoryData(); // Refresh inventory store
    };

    const getSectionTitle = (entityType: EntityType) => {
        switch (entityType) {
            case 'rooms': return 'Rooms';
            case 'places': return 'Places';
            case 'containers': return 'Containers';
            case 'tags': return 'Tags';
        }
    };

    const getSectionIcon = (entityType: EntityType) => {
        switch (entityType) {
            case 'rooms': return 'home-outline';
            case 'places': return 'location-outline';
            case 'containers': return 'cube-outline';
            case 'tags': return 'pricetag-outline';
        }
    };

    const getSectionData = (entityType: EntityType) => {
        switch (entityType) {
            case 'rooms': return rooms;
            case 'places': return places;
            case 'containers': return containers;
            case 'tags': return tags;
        }
    };

    const getSectionDescription = (entityType: EntityType) => {
        switch (entityType) {
            case 'rooms': return 'Organize your items by room locations';
            case 'places': return 'Define specific places within your rooms';
            case 'containers': return 'Create containers to group items together';
            case 'tags': return 'Add tags to categorize and organize your items';
        }
    };

    const getDefaultExpanded = (entityType: EntityType) => {
        // Expand sections with data or if it's rooms (most important)
        switch (entityType) {
            case 'rooms': return true; // Always expanded as it's the foundation
            case 'places': return places.length > 0;
            case 'containers': return containers.length > 0;
            case 'tags': return tags.length > 0;
        }
    };

    const statsData = [
        { label: 'Rooms', value: rooms.length, icon: 'home-outline' as const },
        { label: 'Places', value: places.length, icon: 'location-outline' as const },
        { label: 'Containers', value: containers.length, icon: 'cube-outline' as const },
        { label: 'Tags', value: tags.length, icon: 'pricetag-outline' as const },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={styles.header}>
                <ThemedText style={styles.title}>Manage Inventory</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Create, edit, and organize your rooms, places, containers, and tags
                </ThemedText>
            </ThemedView>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Card */}
                <StatsCard
                    stats={statsData}
                    title="Inventory Structure"
                />

                {(['rooms', 'places', 'containers', 'tags'] as EntityType[]).map((entityType) => (
                    <ManageSection
                        key={entityType}
                        title={getSectionTitle(entityType)}
                        description={getSectionDescription(entityType)}
                        icon={getSectionIcon(entityType) as any}
                        data={getSectionData(entityType)}
                        loading={loading}
                        onAdd={() => handleCreate(entityType)}
                        onEdit={(item: ManageItem) => handleEdit(entityType, item)}
                        onDelete={(item: ManageItem) => handleDelete(entityType, item)}
                        entityType={entityType}
                        allRooms={rooms}
                        allPlaces={places}
                        defaultExpanded={getDefaultExpanded(entityType)}
                    />
                ))}
            </ScrollView>

            <CreateItemModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
                entityType={selectedEntityType}
                allRooms={rooms}
                allPlaces={places}
            />

            <EditItemModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
                entityType={selectedEntityType}
                item={selectedItem}
                allRooms={rooms}
                allPlaces={places}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
});
