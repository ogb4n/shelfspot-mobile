import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ITEM_STATUSES } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useInventoryData } from '../../stores/inventory';
import { ItemFormData, ItemWithLocation } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface EditItemModalProps {
    visible: boolean;
    onClose: () => void;
    onUpdateItem: (itemId: number, updatedData: Partial<ItemFormData>) => void;
    item: ItemWithLocation | null;
}

export function EditItemModal({ visible, onClose, onUpdateItem, item }: EditItemModalProps) {
    const { showSuccess } = useToast();
    const [formData, setFormData] = useState<Partial<ItemFormData>>({
        name: '',
        quantity: 1,
        status: 'available',
        price: undefined,
        itemLink: '',
        roomId: undefined,
        placeId: undefined,
        containerId: undefined,
        tagIds: [],
    });

    // Get inventory data
    const { rooms, places, containers, tags, dataLoading } = useInventoryData();

    const colors = {
        card: useThemeColor({}, 'card'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        primary: useThemeColor({}, 'primary'),
        backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
        background: useThemeColor({}, 'background'),
    };

    // Update form data when item changes
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                quantity: item.quantity,
                status: item.status,
                price: item.price,
                itemLink: item.itemLink,
                roomId: item.room?.id,
                placeId: item.place?.id,
                containerId: item.container?.id,
                tagIds: item.tags?.map(tag => tag.id) || [],
            });
        }
    }, [item]);

    const updateFormData = (field: keyof ItemFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleTag = (tagId: number) => {
        const currentTagIds = formData.tagIds || [];
        const isSelected = currentTagIds.includes(tagId);
        if (isSelected) {
            updateFormData('tagIds', currentTagIds.filter(id => id !== tagId));
        } else {
            updateFormData('tagIds', [...currentTagIds, tagId]);
        }
    };

    // Get available places for selected room
    const getAvailablePlaces = () => {
        if (!formData.roomId) return [];
        return places.filter(place => place.roomId === formData.roomId);
    };

    // Get available containers for selected place
    const getAvailableContainers = () => {
        if (!formData.placeId) return [];
        return containers.filter(container => container.placeId === formData.placeId);
    };

    const canSave = () => {
        return formData.name?.trim() !== '' &&
            formData.quantity !== undefined &&
            formData.quantity > 0;
    };

    const handleSubmit = () => {
        if (!canSave() || !item) return;

        // Include all editable fields for update
        const updateData = {
            name: formData.name,
            quantity: formData.quantity,
            status: formData.status,
            ...(formData.roomId !== undefined && { roomId: formData.roomId }),
            ...(formData.placeId !== undefined && { placeId: formData.placeId }),
            ...(formData.containerId !== undefined && { containerId: formData.containerId }),
            ...(formData.price !== undefined && { price: formData.price }),
            ...(formData.itemLink !== undefined && { itemLink: formData.itemLink }),
            ...(formData.tagIds !== undefined && { tagIds: formData.tagIds }),
        };

        onUpdateItem(item.id, updateData);
        handleClose();
        showSuccess('Item has been updated!');
    };

    const handleClose = () => {
        setFormData({
            name: '',
            quantity: 1,
            status: 'available',
            roomId: undefined,
            placeId: undefined,
            containerId: undefined,
            tagIds: [],
        });
        onClose();
    };

    if (!item) return null;

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
                        Edit Item
                    </ThemedText>
                    <Button
                        title="Save"
                        onPress={handleSubmit}
                        disabled={!canSave()}
                        loading={false}
                        style={styles.saveButton}
                    />
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>

                        {/* Basic Information */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Basic Information
                            </ThemedText>

                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Item Name *
                                </ThemedText>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.text
                                    }]}
                                    placeholder="Ex: Colgate Toothpaste"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.name}
                                    onChangeText={(text) => updateFormData('name', text)}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Quantity
                                </ThemedText>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                                        onPress={() => updateFormData('quantity', Math.max(1, (formData.quantity || 1) - 1))}
                                    >
                                        <IconSymbol name="minus" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.quantityInput, {
                                            backgroundColor: colors.backgroundSecondary,
                                            color: colors.text
                                        }]}
                                        value={(formData.quantity || 1).toString()}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 1;
                                            updateFormData('quantity', Math.max(1, num));
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                                        onPress={() => updateFormData('quantity', (formData.quantity || 1) + 1)}
                                    >
                                        <IconSymbol name="plus" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Status
                                </ThemedText>
                                <View style={styles.statusButtons}>
                                    {ITEM_STATUSES.map((status) => (
                                        <TouchableOpacity
                                            key={status.value}
                                            style={[
                                                styles.statusButton,
                                                {
                                                    backgroundColor: formData.status === status.value
                                                        ? colors.primary
                                                        : colors.backgroundSecondary,
                                                }
                                            ]}
                                            onPress={() => updateFormData('status', status.value)}
                                        >
                                            <ThemedText style={[
                                                styles.statusButtonText,
                                                {
                                                    color: formData.status === status.value
                                                        ? '#FFFFFF'
                                                        : colors.textSecondary
                                                }
                                            ]}>
                                                {status.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Location */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Location
                            </ThemedText>

                            {dataLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        Loading locations...
                                    </ThemedText>
                                </View>
                            ) : (
                                <>
                                    {/* Room Selection */}
                                    <View style={styles.inputGroup}>
                                        <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                            Room *
                                        </ThemedText>
                                        <View style={styles.selectionGrid}>
                                            {rooms.map((room) => (
                                                <TouchableOpacity
                                                    key={room.id}
                                                    style={[
                                                        styles.selectionButton,
                                                        {
                                                            backgroundColor: formData.roomId === room.id
                                                                ? colors.primary
                                                                : colors.backgroundSecondary,
                                                        }
                                                    ]}
                                                    onPress={() => {
                                                        updateFormData('roomId', room.id);
                                                        // Reset place and container when room changes
                                                        updateFormData('placeId', undefined);
                                                        updateFormData('containerId', undefined);
                                                    }}
                                                >
                                                    <ThemedText style={[
                                                        styles.selectionButtonText,
                                                        {
                                                            color: formData.roomId === room.id
                                                                ? '#FFFFFF'
                                                                : colors.text
                                                        }
                                                    ]}>
                                                        {room.name}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Place Selection */}
                                    {formData.roomId && (
                                        <View style={styles.inputGroup}>
                                            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                                Place *
                                            </ThemedText>
                                            <View style={styles.selectionGrid}>
                                                {getAvailablePlaces().map((place) => (
                                                    <TouchableOpacity
                                                        key={place.id}
                                                        style={[
                                                            styles.selectionButton,
                                                            {
                                                                backgroundColor: formData.placeId === place.id
                                                                    ? colors.primary
                                                                    : colors.backgroundSecondary,
                                                            }
                                                        ]}
                                                        onPress={() => {
                                                            updateFormData('placeId', place.id);
                                                            // Reset container when place changes
                                                            updateFormData('containerId', undefined);
                                                        }}
                                                    >
                                                        <ThemedText style={[
                                                            styles.selectionButtonText,
                                                            {
                                                                color: formData.placeId === place.id
                                                                    ? '#FFFFFF'
                                                                    : colors.text
                                                            }
                                                        ]}>
                                                            {place.name}
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Container Selection (Optional) */}
                                    {formData.placeId && getAvailableContainers().length > 0 && (
                                        <View style={styles.inputGroup}>
                                            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                                Container (Optional)
                                            </ThemedText>
                                            <View style={styles.selectionGrid}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.selectionButton,
                                                        {
                                                            backgroundColor: !formData.containerId
                                                                ? colors.primary
                                                                : colors.backgroundSecondary,
                                                        }
                                                    ]}
                                                    onPress={() => updateFormData('containerId', undefined)}
                                                >
                                                    <ThemedText style={[
                                                        styles.selectionButtonText,
                                                        {
                                                            color: !formData.containerId
                                                                ? '#FFFFFF'
                                                                : colors.text
                                                        }
                                                    ]}>
                                                        None
                                                    </ThemedText>
                                                </TouchableOpacity>
                                                {getAvailableContainers().map((container) => (
                                                    <TouchableOpacity
                                                        key={container.id}
                                                        style={[
                                                            styles.selectionButton,
                                                            {
                                                                backgroundColor: formData.containerId === container.id
                                                                    ? colors.primary
                                                                    : colors.backgroundSecondary,
                                                            }
                                                        ]}
                                                        onPress={() => updateFormData('containerId', container.id)}
                                                    >
                                                        <ThemedText style={[
                                                            styles.selectionButtonText,
                                                            {
                                                                color: formData.containerId === container.id
                                                                    ? '#FFFFFF'
                                                                    : colors.text
                                                            }
                                                        ]}>
                                                            {container.name}
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Tags */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Tags
                            </ThemedText>

                            {dataLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        Loading tags...
                                    </ThemedText>
                                </View>
                            ) : tags.length === 0 ? (
                                <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                                    No tags available. You can create tags in the settings.
                                </ThemedText>
                            ) : (
                                <View style={styles.inputGroup}>
                                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        Select Tags (Optional)
                                    </ThemedText>
                                    <View style={styles.selectionGrid}>
                                        {tags.map((tag) => (
                                            <TouchableOpacity
                                                key={tag.id}
                                                style={[
                                                    styles.selectionButton,
                                                    {
                                                        backgroundColor: (formData.tagIds || []).includes(tag.id)
                                                            ? colors.primary
                                                            : colors.backgroundSecondary,
                                                    }
                                                ]}
                                                onPress={() => toggleTag(tag.id)}
                                            >
                                                <ThemedText style={[
                                                    styles.selectionButtonText,
                                                    {
                                                        color: (formData.tagIds || []).includes(tag.id)
                                                            ? '#FFFFFF'
                                                            : colors.text
                                                    }
                                                ]}>
                                                    {tag.name}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {(formData.tagIds || []).length > 0 && (
                                        <View style={styles.selectedTagsContainer}>
                                            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                                Selected Tags
                                            </ThemedText>
                                            <View style={styles.tagsDisplay}>
                                                {(formData.tagIds || []).map((tagId) => {
                                                    const tag = tags.find(t => t.id === tagId);
                                                    return tag ? (
                                                        <View key={tagId} style={[styles.tagChip, { backgroundColor: colors.primary }]}>
                                                            <ThemedText style={styles.tagChipText}>
                                                                {tag.name}
                                                            </ThemedText>
                                                        </View>
                                                    ) : null;
                                                })}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Additional Details */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Additional Details
                            </ThemedText>

                            {/* Price Field */}
                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Price (Optional)
                                </ThemedText>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.text,
                                        borderColor: colors.backgroundSecondary,
                                    }]}
                                    placeholder="Enter price"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.price?.toString() || ''}
                                    onChangeText={(text) => {
                                        const numericValue = text.replace(/[^0-9.]/g, '');
                                        if (numericValue === '') {
                                            updateFormData('price', undefined);
                                        } else {
                                            const price = parseFloat(numericValue);
                                            updateFormData('price', isNaN(price) ? undefined : price);
                                        }
                                    }}
                                    keyboardType="decimal-pad"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Item Link Field */}
                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Item Link (Optional)
                                </ThemedText>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.text,
                                        borderColor: colors.backgroundSecondary,
                                    }]}
                                    placeholder="Enter item link or reference"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.itemLink || ''}
                                    onChangeText={(text) => updateFormData('itemLink', text)}
                                    keyboardType="url"
                                    returnKeyType="done"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Consumable Toggle - Temporarily disabled until backend supports it */}
                            {/* 
                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Item Type
                                </ThemedText>
                                <View style={styles.statusButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            {
                                                backgroundColor: !formData.consumable
                                                    ? colors.primary
                                                    : colors.backgroundSecondary,
                                            }
                                        ]}
                                        onPress={() => updateFormData('consumable', false)}
                                    >
                                        <ThemedText style={[
                                            styles.statusButtonText,
                                            {
                                                color: !formData.consumable
                                                    ? '#FFFFFF'
                                                    : colors.textSecondary
                                            }
                                        ]}>
                                            Non-consumable
                                        </ThemedText>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            {
                                                backgroundColor: formData.consumable
                                                    ? colors.primary
                                                    : colors.backgroundSecondary,
                                            }
                                        ]}
                                        onPress={() => updateFormData('consumable', true)}
                                    >
                                        <ThemedText style={[
                                            styles.statusButtonText,
                                            {
                                                color: formData.consumable
                                                    ? '#FFFFFF'
                                                    : colors.textSecondary
                                            }
                                        ]}>
                                            Consumable
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            */}
                        </View>

                        {/* Current Item Info */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Current Information
                            </ThemedText>

                            <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Current Room:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        {item.room?.name || 'Not set'}
                                    </ThemedText>
                                </View>

                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Current Place:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        {item.place?.name || 'Not set'}
                                    </ThemedText>
                                </View>

                                {item.container && (
                                    <View style={styles.infoRow}>
                                        <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                            Current Container:
                                        </ThemedText>
                                        <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                            {item.container.name}
                                        </ThemedText>
                                    </View>
                                )}

                                {/* Temporarily disabled until backend supports consumable field */}
                                {/* 
                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Type:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        {item.consumable ? 'Consumable' : 'Non-consumable'}
                                    </ThemedText>
                                </View>
                                */}

                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Created:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                                    </ThemedText>
                                </View>

                                {item.tags && item.tags.length > 0 && (
                                    <View style={styles.infoRow}>
                                        <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                            Tags:
                                        </ThemedText>
                                        <View style={styles.tagsContainer}>
                                            {item.tags.map((tag) => (
                                                <View
                                                    key={tag.id}
                                                    style={[styles.tag, { backgroundColor: colors.primary }]}
                                                >
                                                    <ThemedText style={styles.tagText}>
                                                        {tag.name}
                                                    </ThemedText>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {item.price && (
                                    <View style={styles.infoRow}>
                                        <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                            Current Price:
                                        </ThemedText>
                                        <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                            ${item.price.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                )}

                                {item.itemLink && (
                                    <View style={styles.infoRow}>
                                        <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                            Current Link:
                                        </ThemedText>
                                        <ThemedText 
                                            style={[styles.infoValue, { color: colors.primary }]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.itemLink}
                                        </ThemedText>
                                    </View>
                                )}

                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Editable Fields:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        Name, Quantity, Status, Location, Tags, Price, Link
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
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
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    consumableToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    consumableText: {
        fontSize: 16,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        flex: 1,
        textAlign: 'right',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        flex: 1,
        justifyContent: 'flex-end',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '500',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
    },
    placeholderText: {
        fontSize: 16,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 40,
    },
    selectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectionButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80,
    },
    selectionButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedTagsContainer: {
        marginTop: 16,
    },
    tagsDisplay: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    tagChipText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
});
