import { useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { DEFAULT_ALERT_THRESHOLD } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';
import { AlertFormData, ItemWithLocation } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Button } from '../ui/Button';
import { IconSymbol } from '../ui/IconSymbol';

interface CreateAlertWithItemSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateAlert: (alertData: AlertFormData) => void;
    items: ItemWithLocation[];
}

export function CreateAlertWithItemSelectorModal({
    visible,
    onClose,
    onCreateAlert,
    items
}: CreateAlertWithItemSelectorModalProps) {
    const [formData, setFormData] = useState<AlertFormData>({
        itemId: 0,
        threshold: DEFAULT_ALERT_THRESHOLD,
        name: '',
        isActive: true,
    });
    const [selectedItem, setSelectedItem] = useState<ItemWithLocation | null>(null);
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const colors = {
        card: useThemeColor({}, 'card'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        primary: useThemeColor({}, 'primary'),
        backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
        background: useThemeColor({}, 'background'),
        error: useThemeColor({}, 'error'),
        border: useThemeColor({}, 'border'),
    };

    // Filter items based on search query
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );

    const updateFormData = (field: keyof AlertFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canCreateAlert = () => {
        return formData.itemId > 0 &&
            formData.threshold > 0 &&
            (formData.name?.trim() || '') !== '';
    };

    const handleItemSelect = (item: ItemWithLocation) => {
        setSelectedItem(item);
        updateFormData('itemId', item.id);
        setShowItemSelector(false);
        setItemSearchQuery('');
    };

    const handleSubmit = async () => {
        if (!canCreateAlert()) return;

        setIsSubmitting(true);
        try {
            await onCreateAlert(formData);
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            itemId: 0,
            threshold: DEFAULT_ALERT_THRESHOLD,
            name: '',
            isActive: true,
        });
        setSelectedItem(null);
        setShowItemSelector(false);
        setItemSearchQuery('');
        onClose();
    };

    const renderItemSelector = () => (
        <View style={styles.selectorContainer}>
            {/* Selector Header */}
            <View style={[styles.selectorHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowItemSelector(false)} style={styles.closeButton}>
                    <IconSymbol name="arrow.left" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={[styles.selectorTitle, { color: colors.text }]}>
                    Select Item
                </ThemedText>
                <View style={styles.headerSpace} />
            </View>

            {/* Search */}
            <View style={styles.selectorSearchContainer}>
                <View style={[styles.selectorSearchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                    <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.selectorSearchInput, { color: colors.text }]}
                        placeholder="Search items..."
                        placeholderTextColor={colors.textSecondary}
                        value={itemSearchQuery}
                        onChangeText={setItemSearchQuery}
                    />
                </View>
            </View>

            {/* Items List */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id.toString()}
                style={styles.itemsList}
                contentContainerStyle={styles.itemsListContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.itemOption, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                        onPress={() => handleItemSelect(item)}
                    >
                        <View style={styles.itemOptionContent}>
                            <ThemedText style={[styles.itemOptionName, { color: colors.text }]}>
                                {item.name}
                            </ThemedText>
                            <ThemedText style={[styles.itemOptionDetails, { color: colors.textSecondary }]}>
                                Quantity: {item.quantity} • {item.location}
                            </ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyItems}>
                        <IconSymbol name="cube.box" size={48} color={colors.textSecondary} />
                        <ThemedText style={[styles.emptyItemsText, { color: colors.textSecondary }]}>
                            {itemSearchQuery ? 'No items found' : 'No items available'}
                        </ThemedText>
                    </View>
                )}
            />
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <ThemedView style={styles.container}>
                {showItemSelector ? (
                    renderItemSelector()
                ) : (
                    <>
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: colors.backgroundSecondary }]}>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.text }]}>
                                Create Alert
                            </ThemedText>
                            <View style={styles.headerSpace} />
                        </View>

                        {/* Content */}
                        <ScrollView style={styles.content}>
                            <View style={styles.formContainer}>
                                {/* Item Selection */}
                                <View style={styles.inputGroup}>
                                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        Select Item *
                                    </ThemedText>
                                    <TouchableOpacity
                                        style={[styles.itemSelector, {
                                            backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.border
                                        }]}
                                        onPress={() => setShowItemSelector(true)}
                                    >
                                        {selectedItem ? (
                                            <View style={styles.selectedItemContent}>
                                                <IconSymbol name="cube.box" size={20} color={colors.primary} />
                                                <View style={styles.selectedItemInfo}>
                                                    <ThemedText style={[styles.selectedItemName, { color: colors.text }]}>
                                                        {selectedItem.name}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.selectedItemDetails, { color: colors.textSecondary }]}>
                                                        Quantity: {selectedItem.quantity} • {selectedItem.location}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        ) : (
                                            <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                                                Choose an item for the alert
                                            </ThemedText>
                                        )}
                                        <IconSymbol name="chevron.down" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Alert Name */}
                                <View style={styles.inputGroup}>
                                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        Alert Name *
                                    </ThemedText>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: colors.backgroundSecondary,
                                            color: colors.text,
                                            borderColor: colors.border
                                        }]}
                                        placeholder="E.g.: Stock running low"
                                        placeholderTextColor={colors.textSecondary}
                                        value={formData.name}
                                        onChangeText={(text) => updateFormData('name', text)}
                                    />
                                </View>

                                {/* Threshold */}
                                <View style={styles.inputGroup}>
                                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                        Alert Threshold *
                                    </ThemedText>
                                    <View style={styles.thresholdContainer}>
                                        <TouchableOpacity
                                            style={[styles.thresholdButton, { backgroundColor: colors.backgroundSecondary }]}
                                            onPress={() => updateFormData('threshold', Math.max(1, formData.threshold - 1))}
                                        >
                                            <IconSymbol name="minus" size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[styles.thresholdInput, {
                                                backgroundColor: colors.backgroundSecondary,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }]}
                                            value={formData.threshold.toString()}
                                            onChangeText={(text) => {
                                                const num = parseInt(text) || 1;
                                                updateFormData('threshold', Math.max(1, num));
                                            }}
                                            keyboardType="numeric"
                                        />
                                        <TouchableOpacity
                                            style={[styles.thresholdButton, { backgroundColor: colors.backgroundSecondary }]}
                                            onPress={() => updateFormData('threshold', formData.threshold + 1)}
                                        >
                                            <IconSymbol name="plus" size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                    <ThemedText style={[styles.thresholdHelp, { color: colors.textSecondary }]}>
                                        The alert will trigger when quantity is equal or below {formData.threshold}
                                    </ThemedText>
                                </View>

                                {/* Active Status */}
                                <TouchableOpacity
                                    style={styles.activeToggle}
                                    onPress={() => updateFormData('isActive', !formData.isActive)}
                                >
                                    <IconSymbol
                                        name={formData.isActive ? "checkmark.square" : "square"}
                                        size={24}
                                        color={formData.isActive ? colors.primary : colors.textSecondary}
                                    />
                                    <View style={styles.activeToggleText}>
                                        <ThemedText style={[styles.activeLabel, { color: colors.text }]}>
                                            Active Alert
                                        </ThemedText>
                                        <ThemedText style={[styles.activeDescription, { color: colors.textSecondary }]}>
                                            The alert will be checked automatically
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>

                                {/* Info Card */}
                                <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
                                    <IconSymbol name="info.circle" size={20} color={colors.primary} />
                                    <View style={styles.infoText}>
                                        <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                                            How does it work?
                                        </ThemedText>
                                        <ThemedText style={[styles.infoDescription, { color: colors.textSecondary }]}>
                                            This alert will automatically check the stock of the selected item and notify you when the quantity reaches the defined threshold.
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={[styles.footer, { borderTopColor: colors.backgroundSecondary }]}>
                            <View style={styles.footerButtons}>
                                <Button
                                    title="Cancel"
                                    onPress={handleClose}
                                    variant="outline"
                                    style={{ flex: 0.4 }}
                                />
                                <Button
                                    title="Create Alert"
                                    onPress={handleSubmit}
                                    disabled={!canCreateAlert()}
                                    loading={isSubmitting}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </>
                )}
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
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    itemSelector: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
    },
    selectedItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    selectedItemInfo: {
        flex: 1,
    },
    selectedItemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    selectedItemDetails: {
        fontSize: 12,
        marginTop: 2,
    },
    placeholderText: {
        fontSize: 16,
    },
    thresholdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    thresholdButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thresholdInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
        textAlign: 'center',
        minWidth: 80,
        borderWidth: 1,
    },
    thresholdHelp: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    activeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    activeToggleText: {
        flex: 1,
    },
    activeLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    activeDescription: {
        fontSize: 14,
        marginTop: 2,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 12,
        lineHeight: 16,
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
    // Item Selector Styles
    selectorContainer: {
        flex: 1,
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    selectorTitle: {
        fontSize: 18,
    },
    selectorSearchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    selectorSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    selectorSearchInput: {
        flex: 1,
        fontSize: 16,
        minHeight: 20,
    },
    itemsList: {
        flex: 1,
    },
    itemsListContent: {
        paddingBottom: 20,
    },
    itemOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    itemOptionContent: {
        flex: 1,
    },
    itemOptionName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemOptionDetails: {
        fontSize: 14,
    },
    emptyItems: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyItemsText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
