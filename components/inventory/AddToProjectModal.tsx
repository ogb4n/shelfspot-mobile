import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { backendApi } from '@/services/backend-api';
import { Project } from '@/types';
import { ItemWithLocation } from '@/types/inventory';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddToProjectModalProps {
    visible: boolean;
    item: ItemWithLocation | null;
    onClose: () => void;
    onItemAdded: () => void;
}

export function AddToProjectModal({
    visible,
    item,
    onClose,
    onItemAdded,
}: AddToProjectModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const colors = {
        card: useThemeColor({}, 'card'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        primary: useThemeColor({}, 'primary'),
        backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
        background: useThemeColor({}, 'background'),
        border: useThemeColor({}, 'border'),
    };

    useEffect(() => {
        if (visible) {
            loadProjects();
            // Reset form
            setSelectedProject(null);
            setQuantity(1);
            setIsActive(true);
        }
    }, [visible]);

    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            const projectsData = await backendApi.getProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('Error loading projects:', error);
            Alert.alert('Error', 'Failed to load projects');
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedProject || !item) return;

        try {
            setLoading(true);
            await backendApi.addItemToProject(selectedProject.id, {
                itemId: item.id,
                quantity,
                isActive,
            });

            onItemAdded();
            Alert.alert('Success', `Item added to project "${selectedProject.name}"`);
        } catch (error: any) {
            console.error('Error adding item to project:', error);
            Alert.alert('Error', error.message || 'Failed to add item to project');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedProject(null);
        setQuantity(1);
        setIsActive(true);
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
                        Add to Project
                    </ThemedText>
                    <View style={styles.headerSpace} />
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        {/* Item Info */}
                        <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
                                {item.name}
                            </ThemedText>
                            <ThemedText style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                                Available: {item.quantity}
                            </ThemedText>
                        </View>

                        {/* Project Selection */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Select Project
                            </ThemedText>

                            {loadingProjects ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        Loading projects...
                                    </ThemedText>
                                </View>
                            ) : projects.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                                        No projects available
                                    </ThemedText>
                                </View>
                            ) : (
                                <View style={styles.projectsList}>
                                    {projects.map((project) => (
                                        <TouchableOpacity
                                            key={project.id}
                                            style={[
                                                styles.projectItem,
                                                {
                                                    backgroundColor: selectedProject?.id === project.id
                                                        ? colors.primary + '20'
                                                        : colors.backgroundSecondary,
                                                    borderColor: selectedProject?.id === project.id
                                                        ? colors.primary
                                                        : colors.border,
                                                }
                                            ]}
                                            onPress={() => setSelectedProject(project)}
                                        >
                                            <View style={styles.projectInfo}>
                                                <ThemedText
                                                    type="defaultSemiBold"
                                                    style={[
                                                        styles.projectName,
                                                        {
                                                            color: selectedProject?.id === project.id
                                                                ? colors.primary
                                                                : colors.text
                                                        }
                                                    ]}
                                                >
                                                    {project.name}
                                                </ThemedText>
                                                {project.description && (
                                                    <ThemedText
                                                        style={[
                                                            styles.projectDescription,
                                                            { color: colors.textSecondary }
                                                        ]}
                                                    >
                                                        {project.description}
                                                    </ThemedText>
                                                )}
                                            </View>
                                            {selectedProject?.id === project.id && (
                                                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Quantity */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.text }]}>
                                Quantity
                            </ThemedText>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <IconSymbol name="minus" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                                <TextInput
                                    style={[styles.quantityInput, {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    }]}
                                    value={quantity.toString()}
                                    onChangeText={(text) => {
                                        const num = parseInt(text) || 1;
                                        setQuantity(Math.max(1, Math.min(num, item.quantity)));
                                    }}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                                    onPress={() => setQuantity(Math.min(item.quantity, quantity + 1))}
                                >
                                    <IconSymbol name="plus" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Active Status */}
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={styles.activeToggle}
                                onPress={() => setIsActive(!isActive)}
                            >
                                <IconSymbol
                                    name={isActive ? "checkmark.square" : "square"}
                                    size={24}
                                    color={isActive ? colors.primary : colors.textSecondary}
                                />
                                <View style={styles.activeToggleText}>
                                    <ThemedText type="defaultSemiBold" style={[styles.activeLabel, { color: colors.text }]}>
                                        Active in Project
                                    </ThemedText>
                                    <ThemedText style={[styles.activeDescription, { color: colors.textSecondary }]}>
                                        Whether this item is currently being used in the project
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: colors.backgroundSecondary }]}>
                    <View style={styles.footerButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton, { borderColor: colors.textSecondary }]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.primaryButton,
                                {
                                    backgroundColor: (selectedProject && !loading) ? colors.primary : colors.backgroundSecondary,
                                }
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedProject || loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText style={[
                                    styles.primaryButtonText,
                                    { color: selectedProject ? 'white' : colors.textSecondary }
                                ]}>
                                    Add to Project
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
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
    itemCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    itemName: {
        fontSize: 16,
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 14,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    projectsList: {
        gap: 8,
    },
    projectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    projectInfo: {
        flex: 1,
        gap: 4,
    },
    projectName: {
        fontSize: 16,
    },
    projectDescription: {
        fontSize: 14,
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
        borderWidth: 1,
    },
    activeToggle: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    activeToggleText: {
        flex: 1,
        gap: 4,
    },
    activeLabel: {
        fontSize: 16,
    },
    activeDescription: {
        fontSize: 14,
        lineHeight: 20,
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
});
