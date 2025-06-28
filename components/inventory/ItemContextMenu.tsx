import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ItemWithLocation } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

interface ItemContextMenuProps {
    visible: boolean;
    onClose: () => void;
    item: ItemWithLocation | null;
    position: { x: number; y: number };
    onEdit: (item: ItemWithLocation) => void;
    onToggleFavorite: (itemId: number) => void;
    onAddToProject: (item: ItemWithLocation) => void;
    onDelete: (itemId: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function ItemContextMenu({
    visible,
    onClose,
    item,
    position,
    onEdit,
    onToggleFavorite,
    onAddToProject,
    onDelete,
}: ItemContextMenuProps) {
    const backgroundColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');
    const backgroundSecondaryColor = useThemeColor({}, 'backgroundSecondary');

    if (!item) return null;

    const menuWidth = 200;
    const menuHeight = 240;

    // Calculate menu position to ensure it stays within screen bounds
    let menuX = position.x;
    let menuY = position.y;

    if (menuX + menuWidth > screenWidth - 20) {
        menuX = screenWidth - menuWidth - 20;
    }

    if (menuY + menuHeight > screenHeight - 100) {
        menuY = position.y - menuHeight - 20;
    }

    const menuItems = [
        {
            label: 'Edit Item',
            icon: 'pencil' as const,
            color: textColor,
            onPress: () => {
                onEdit(item);
                onClose();
            },
        },
        {
            label: item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
            icon: item.isFavorite ? 'heart.slash' as const : 'heart' as const,
            color: item.isFavorite ? errorColor : primaryColor,
            onPress: () => {
                onToggleFavorite(item.id);
                onClose();
            },
        },
        {
            label: 'Add to Project',
            icon: 'folder.badge.plus' as const,
            color: textColor,
            onPress: () => {
                onAddToProject(item);
                onClose();
            },
        },
        {
            label: 'Delete Item',
            icon: 'trash' as const,
            color: errorColor,
            onPress: () => {
                onDelete(item.id);
                onClose();
            },
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View
                        style={[
                            styles.menu,
                            {
                                backgroundColor,
                                left: menuX,
                                top: menuY,
                                shadowColor: textColor,
                            },
                        ]}
                    >
                        {/* Item Info Header */}
                        <View style={[styles.menuHeader, { borderBottomColor: backgroundSecondaryColor }]}>
                            <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: textColor }]}>
                                {item.name}
                            </ThemedText>
                            <ThemedText style={[styles.itemLocation, { color: textSecondaryColor }]}>
                                {item.location}
                            </ThemedText>
                        </View>

                        {/* Menu Items */}
                        <View style={styles.menuItems}>
                            {menuItems.map((menuItem, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.menuItem,
                                        index < menuItems.length - 1 && {
                                            borderBottomColor: backgroundSecondaryColor,
                                            borderBottomWidth: 1,
                                        },
                                    ]}
                                    onPress={menuItem.onPress}
                                >
                                    <IconSymbol name={menuItem.icon} size={20} color={menuItem.color} />
                                    <ThemedText style={[styles.menuItemText, { color: menuItem.color }]}>
                                        {menuItem.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    menu: {
        position: 'absolute',
        width: 200,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    menuHeader: {
        padding: 16,
        borderBottomWidth: 1,
    },
    itemName: {
        fontSize: 14,
        marginBottom: 4,
    },
    itemLocation: {
        fontSize: 12,
    },
    menuItems: {
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
