import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { backendApi } from '../../services/backend-api';
import { ProjectItem, UpdateProjectItemDto } from '../../types';

interface ProjectItemCardProps {
    projectItem: ProjectItem;
    onUpdate: () => void;
    onRemove: () => void;
}

export function ProjectItemCard({ projectItem, onUpdate, onRemove }: ProjectItemCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [importanceScore, setImportanceScore] = useState(
        projectItem.importanceScore?.toString() || '1'
    );
    const [notes, setNotes] = useState(projectItem.notes || '');
    const [loading, setLoading] = useState(false);

    const colors = {
        card: useThemeColor({}, 'card'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        primary: useThemeColor({}, 'primary'),
        backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
        background: useThemeColor({}, 'background'),
        border: useThemeColor({}, 'border'),
    };

    const handleRemove = () => {
        Alert.alert(
            'Remove Item',
            `Are you sure you want to remove "${projectItem.item.name}" from this project?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await backendApi.removeItemFromProject(
                                projectItem.projectId,
                                projectItem.itemId
                            );
                            onRemove();
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to remove item from project.');
                        }
                    },
                },
            ]
        );
    };

    const handleUpdate = async () => {
        const score = parseInt(importanceScore);
        if (isNaN(score) || score < 1 || score > 10) {
            Alert.alert('Error', 'Importance score must be between 1 and 10.');
            return;
        }

        try {
            setLoading(true);
            const data: UpdateProjectItemDto = {
                importanceScore: score,
                notes: notes.trim() || undefined,
            };

            await backendApi.updateProjectItem(
                projectItem.projectId,
                projectItem.itemId,
                data
            );
            setShowEditModal(false);
            onUpdate();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to update project item.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score?: number) => {
        if (!score) return colors.textSecondary;
        if (score >= 8) return '#ef4444'; // Red for high importance
        if (score >= 5) return '#f59e0b'; // Yellow for medium importance
        return '#10b981'; // Green for low importance
    };

    return (
        <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: colors.text }]}>
                            {projectItem.item.name}
                        </Text>
                        {projectItem.item.description && (
                            <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                                {projectItem.item.description}
                            </Text>
                        )}
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setShowEditModal(true)}
                        >
                            <Ionicons name="pencil" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleRemove}
                        >
                            <Ionicons name="trash" size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.scoreContainer}>
                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                            Importance Score:
                        </Text>
                        <View
                            style={[
                                styles.scoreBadge,
                                { backgroundColor: getScoreColor(projectItem.importanceScore) },
                            ]}
                        >
                            <Text style={styles.scoreText}>
                                {projectItem.importanceScore || 1}/10
                            </Text>
                        </View>
                    </View>

                    {projectItem.notes && (
                        <View style={styles.notesContainer}>
                            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                                Notes:
                            </Text>
                            <Text style={[styles.notesText, { color: colors.text }]}>
                                {projectItem.notes}
                            </Text>
                        </View>
                    )}

                    <View style={styles.itemMeta}>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            Qty: {projectItem.item.quantity}
                        </Text>
                        {projectItem.item.isConsumable && (
                            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.badgeText}>Consumable</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowEditModal(false)}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Edit Project Item
                        </Text>
                        <View style={styles.headerSpace} />
                    </View>

                    <View style={styles.modalContent}>
                        <View style={[styles.itemPreview, { backgroundColor: colors.card }]}>
                            <Text style={[styles.itemName, { color: colors.text }]}>
                                {projectItem.item.name}
                            </Text>
                            {projectItem.item.description && (
                                <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                                    {projectItem.item.description}
                                </Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                Importance Score (1-10)
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.backgroundSecondary, color: colors.text },
                                ]}
                                placeholder="1"
                                placeholderTextColor={colors.textSecondary}
                                value={importanceScore}
                                onChangeText={setImportanceScore}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                Notes (Optional)
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    { backgroundColor: colors.backgroundSecondary, color: colors.text },
                                ]}
                                placeholder="Add notes about this item in the project..."
                                placeholderTextColor={colors.textSecondary}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                        <View style={styles.footerButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.secondaryButton,
                                    { borderColor: colors.border },
                                ]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.primaryButton,
                                    { backgroundColor: colors.primary },
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleUpdate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
    },
    cardBody: {
        gap: 12,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    scoreBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    scoreText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    notesContainer: {
        gap: 4,
    },
    notesLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    notesText: {
        fontSize: 14,
        lineHeight: 20,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSpace: {
        width: 32,
    },
    modalContent: {
        flex: 1,
        padding: 20,
        gap: 20,
    },
    itemPreview: {
        padding: 16,
        borderRadius: 12,
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
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalFooter: {
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
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
    disabledButton: {
        opacity: 0.5,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
