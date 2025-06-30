import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ITEM_STATUSES } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';
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
    const [formData, setFormData] = useState<Partial<ItemFormData>>({
        name: '',
        quantity: 1,
        status: 'available',
        consumable: false,
    });

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
                consumable: item.consumable,
            });
        }
    }, [item]);

    const updateFormData = (field: keyof ItemFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canSave = () => {
        return formData.name?.trim() !== '' &&
            formData.quantity !== undefined &&
            formData.quantity > 0;
    };

    const handleSubmit = () => {
        if (!canSave() || !item) return;

        // Remove consumable property from updates - it should only be set during creation
        const { consumable, ...updateData } = formData;

        onUpdateItem(item.id, updateData);
        handleClose();
        Alert.alert('Success', 'Item has been updated!');
    };

    const handleClose = () => {
        setFormData({
            name: '',
            quantity: 1,
            status: 'available',
            consumable: false,
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
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: canSave() ? colors.primary : colors.backgroundSecondary }
                        ]}
                        onPress={handleSubmit}
                        disabled={!canSave()}
                    >
                        <ThemedText style={[
                            styles.saveButtonText,
                            { color: canSave() ? '#FFFFFF' : colors.textSecondary }
                        ]}>
                            Save
                        </ThemedText>
                    </TouchableOpacity>
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

                        {/* Current Item Info */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Current Information
                            </ThemedText>

                            <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Location:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        {item.location}
                                    </ThemedText>
                                </View>

                                <View style={styles.infoRow}>
                                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Type:
                                    </ThemedText>
                                    <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                                        {item.consumable ? 'Consumable' : 'Non-consumable'}
                                    </ThemedText>
                                </View>

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
});
