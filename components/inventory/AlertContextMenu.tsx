import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Alert } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

interface AlertContextMenuProps {
    visible: boolean;
    onClose: () => void;
    alert: Alert | null;
    position: { x: number; y: number };
    onEdit: (alert: Alert) => void;
    onToggleActive: (alertId: number, currentStatus: boolean) => void;
    onViewItem: (itemId: number) => void;
    onDelete: (alertId: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function AlertContextMenu({
    visible,
    onClose,
    alert,
    position,
    onEdit,
    onToggleActive,
    onViewItem,
    onDelete,
}: AlertContextMenuProps) {
    const backgroundColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const textSecondaryColor = useThemeColor({}, 'textSecondary');
    const primaryColor = useThemeColor({}, 'primary');
    const errorColor = useThemeColor({}, 'error');
    const warningColor = useThemeColor({}, 'warning');
    const backgroundSecondaryColor = useThemeColor({}, 'backgroundSecondary');

    if (!alert) return null;

    const menuWidth = 220;
    const menuHeight = 280;

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
            label: 'Edit Alert',
            icon: 'pencil' as const,
            color: textColor,
            onPress: () => {
                onEdit(alert);
                onClose();
            },
        },
        {
            label: alert.isActive ? 'Disable Alert' : 'Enable Alert',
            icon: alert.isActive ? 'bell.slash' as const : 'bell' as const,
            color: alert.isActive ? warningColor : primaryColor,
            onPress: () => {
                onToggleActive(alert.id, alert.isActive);
                onClose();
            },
        },
        {
            label: 'View Item',
            icon: 'arrow.right.circle' as const,
            color: textColor,
            onPress: () => {
                onViewItem(alert.item.id);
                onClose();
            },
        },
        {
            label: 'Delete Alert',
            icon: 'trash' as const,
            color: errorColor,
            onPress: () => {
                onDelete(alert.id);
                onClose();
            },
        },
    ];

    const getAlertStatusText = () => {
        if (alert.item.quantity === 0) return 'Out of Stock';
        if (alert.item.quantity <= alert.threshold) return 'Low Stock';
        return 'Normal Stock';
    };

    const getAlertStatusColor = () => {
        if (alert.item.quantity === 0) return errorColor;
        if (alert.item.quantity <= alert.threshold) return warningColor;
        return primaryColor;
    };

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
                        {/* Alert Info Header */}
                        <View style={[styles.menuHeader, { borderBottomColor: backgroundSecondaryColor }]}>
                            <View style={styles.alertInfo}>
                                <ThemedText type="defaultSemiBold" style={[styles.alertName, { color: textColor }]}>
                                    {alert.name || `Alert for ${alert.item.name}`}
                                </ThemedText>
                                <ThemedText style={[styles.itemName, { color: textSecondaryColor }]}>
                                    {alert.item.name}
                                </ThemedText>
                                <View style={styles.statusRow}>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: `${getAlertStatusColor()}20` }
                                    ]}>
                                        <ThemedText style={[
                                            styles.statusText,
                                            { color: getAlertStatusColor() }
                                        ]}>
                                            {getAlertStatusText()}
                                        </ThemedText>
                                    </View>
                                    <View style={[
                                        styles.activeBadge,
                                        {
                                            backgroundColor: alert.isActive
                                                ? `${primaryColor}20`
                                                : `${textSecondaryColor}20`
                                        }
                                    ]}>
                                        <ThemedText style={[
                                            styles.activeText,
                                            {
                                                color: alert.isActive
                                                    ? primaryColor
                                                    : textSecondaryColor
                                            }
                                        ]}>
                                            {alert.isActive ? 'Active' : 'Inactive'}
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
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
        width: 220,
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
    alertInfo: {
        gap: 4,
    },
    alertName: {
        fontSize: 14,
        marginBottom: 2,
    },
    itemName: {
        fontSize: 12,
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    activeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    activeText: {
        fontSize: 10,
        fontWeight: '600',
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
