import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

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

interface ManageSectionProps {
    title: string;
    description?: string;
    icon: keyof typeof Ionicons.glyphMap;
    data: ManageItem[];
    loading: boolean;
    onAdd: () => void;
    onEdit: (item: ManageItem) => void;
    onDelete: (item: ManageItem) => void;
    entityType: EntityType;
    allRooms: ManageItem[];
    allPlaces: ManageItem[];
    defaultExpanded?: boolean;
}

export function ManageSection({
    title,
    description,
    icon,
    data,
    loading,
    onAdd,
    onEdit,
    onDelete,
    entityType,
    allRooms,
    allPlaces,
    defaultExpanded = true,
}: ManageSectionProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const getItemSubtitle = (item: ManageItem) => {
        if (entityType === 'places' && item.room) {
            return `Room: ${item.room.name}`;
        }
        if (entityType === 'containers') {
            if (item.room && item.place) {
                return `${item.room.name} → ${item.place.name}`;
            } else if (item.room) {
                return `Room: ${item.room.name}`;
            }
        }
        return item.description || '';
    };

    const renderItem = ({ item }: { item: ManageItem }) => (
        <ThemedView style={[styles.itemContainer, { borderColor: colors.border }]}>
            <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    {getItemSubtitle(item) && (
                        <ThemedText style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                            {getItemSubtitle(item)}
                        </ThemedText>
                    )}
                </View>
                <View style={styles.itemActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                        onPress={() => onEdit(item)}
                    >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                        onPress={() => onDelete(item)}
                    >
                        <Ionicons name="trash" size={16} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );

    return (
        <View style={styles.section}>
            <TouchableOpacity
                style={[styles.sectionHeader, { backgroundColor: colors.card }]}
                onPress={toggleExpanded}
                activeOpacity={0.7}
            >
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name={icon} size={24} color={colors.primary} />
                    <View style={styles.titleTextContainer}>
                        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
                        {description && (
                            <ThemedText style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                                {description}
                            </ThemedText>
                        )}
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
                            {data.length}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                    >
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.expandButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={toggleExpanded}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Loading {title.toLowerCase()}...
                            </ThemedText>
                        </View>
                    ) : data.length === 0 ? (
                        <ThemedView style={[styles.emptyContainer, { borderColor: colors.border }]}>
                            <Ionicons name={icon} size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No {title.toLowerCase()} yet
                            </ThemedText>
                            <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                Tap the + button to create your first {title.toLowerCase().slice(0, -1)}
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    titleTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    sectionDescription: {
        fontSize: 14,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        marginTop: 8,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
    itemContainer: {
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 14,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
