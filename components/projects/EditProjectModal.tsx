import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { backendApi } from '@/services/backend-api';
import { Project, UpdateProjectDto } from '@/types';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface EditProjectModalProps {
    visible: boolean;
    project: Project | null;
    onClose: () => void;
    onProjectUpdated: (updatedProject: Project) => void;
}

// Dropdown options
const STATUS_OPTIONS = [
    { label: 'Active', value: 'ACTIVE' as const },
    { label: 'Paused', value: 'PAUSED' as const },
    { label: 'Completed', value: 'COMPLETED' as const },
    { label: 'Cancelled', value: 'CANCELLED' as const },
];

const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'LOW' as const },
    { label: 'Medium', value: 'MEDIUM' as const },
    { label: 'High', value: 'HIGH' as const },
    { label: 'Critical', value: 'CRITICAL' as const },
];

interface DropdownProps {
    value: string;
    options: { label: string; value: string }[];
    onSelect: (value: string) => void;
    placeholder: string;
    backgroundColor: string;
    textColor: string;
    textSecondaryColor: string;
}

function Dropdown({ value, options, onSelect, placeholder, backgroundColor, textColor, textSecondaryColor }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(option => option.value === value);

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor }]}
                onPress={() => setIsOpen(true)}
            >
                <ThemedText style={[styles.dropdownText, { color: selectedOption ? textColor : textSecondaryColor }]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={textSecondaryColor} />
            </TouchableOpacity>

            <Modal visible={isOpen} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.dropdownOverlay}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={[styles.dropdownModal, { backgroundColor }]}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.dropdownOption}
                                onPress={() => {
                                    onSelect(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                <ThemedText style={[styles.dropdownOptionText, { color: textColor }]}>
                                    {option.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

export function EditProjectModal({ visible, project, onClose, onProjectUpdated }: EditProjectModalProps) {
    const [formData, setFormData] = useState<UpdateProjectDto>({
        name: '',
        description: '',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(false);

    const colors = {
        card: useThemeColor({}, 'card'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        primary: useThemeColor({}, 'primary'),
        backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
        background: useThemeColor({}, 'background'),
    };

    useEffect(() => {
        if (project && visible) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'ACTIVE',
                priority: project.priority || 'MEDIUM',
                startDate: project.startDate || '',
                endDate: project.endDate || '',
            });
        }
    }, [project, visible]);

    const resetForm = () => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'ACTIVE',
                priority: project.priority || 'MEDIUM',
                startDate: project.startDate || '',
                endDate: project.endDate || '',
            });
        }
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const canSave = () => {
        return formData.name?.trim() !== '' && !loading && project;
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0].split('-').reverse().join('/');
    };

    const formatDateForAPI = (dateInput: string) => {
        if (!dateInput) return '';
        // Convert dd/mm/yyyy to ISO string
        const parts = dateInput.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`).toISOString();
        }
        return dateInput;
    };

    const handleSave = async () => {
        if (!canSave() || !project) return;

        setLoading(true);
        try {
            // Create update payload with only changed fields
            const updatePayload: UpdateProjectDto = {};

            if (formData.name !== project.name) {
                updatePayload.name = formData.name;
            }
            if (formData.description !== project.description) {
                updatePayload.description = formData.description;
            }
            if (formData.status !== project.status) {
                updatePayload.status = formData.status;
            }
            if (formData.priority !== project.priority) {
                updatePayload.priority = formData.priority;
            }
            if (formData.startDate !== project.startDate) {
                updatePayload.startDate = formatDateForAPI(formData.startDate || '');
            }
            if (formData.endDate !== project.endDate) {
                updatePayload.endDate = formatDateForAPI(formData.endDate || '');
            }

            // Only make API call if there are changes
            if (Object.keys(updatePayload).length === 0) {
                Alert.alert('Info', 'No changes to save.');
                handleClose();
                return;
            }

            const updatedProject = await backendApi.updateProject(project.id, updatePayload);

            onProjectUpdated(updatedProject);
            handleClose();
            Alert.alert('Success', `Project "${formData.name}" updated successfully!`);
        } catch (error: any) {
            console.error('Error updating project:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to update project. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!project) return null;

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
                        Edit Project
                    </ThemedText>
                    <View style={styles.headerSpace} />
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        {/* Project Name */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                Project Name *
                            </ThemedText>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.backgroundSecondary,
                                    color: colors.text
                                }]}
                                placeholder="Ex: Kitchen Renovation"
                                placeholderTextColor={colors.textSecondary}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                editable={!loading}
                                autoFocus
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                Description
                            </ThemedText>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: colors.backgroundSecondary,
                                    color: colors.text
                                }]}
                                placeholder="Project description..."
                                placeholderTextColor={colors.textSecondary}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                editable={!loading}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Status and Priority Row */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Status
                                </ThemedText>
                                <Dropdown
                                    value={formData.status || 'ACTIVE'}
                                    options={STATUS_OPTIONS}
                                    onSelect={(value) => setFormData({ ...formData, status: value as any })}
                                    placeholder="Select status"
                                    backgroundColor={colors.backgroundSecondary}
                                    textColor={colors.text}
                                    textSecondaryColor={colors.textSecondary}
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Priority
                                </ThemedText>
                                <Dropdown
                                    value={formData.priority || 'MEDIUM'}
                                    options={PRIORITY_OPTIONS}
                                    onSelect={(value) => setFormData({ ...formData, priority: value as any })}
                                    placeholder="Select priority"
                                    backgroundColor={colors.backgroundSecondary}
                                    textColor={colors.text}
                                    textSecondaryColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        {/* Start Date and End Date Row */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    Start Date
                                </ThemedText>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.text
                                    }]}
                                    placeholder="dd/mm/yyyy"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formatDateForInput(formData.startDate || '')}
                                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                                    editable={!loading}
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                    End Date
                                </ThemedText>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.text
                                    }]}
                                    placeholder="dd/mm/yyyy"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formatDateForInput(formData.endDate || '')}
                                    onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                                    editable={!loading}
                                />
                            </View>
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
                                    backgroundColor: canSave() ? colors.primary : colors.backgroundSecondary,
                                }
                            ]}
                            onPress={handleSave}
                            disabled={!canSave()}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText style={[
                                    styles.primaryButtonText,
                                    { color: canSave() ? 'white' : colors.textSecondary }
                                ]}>
                                    Save Changes
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
        height: 100,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    dropdownContainer: {
        position: 'relative',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        minWidth: 200,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    dropdownOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dropdownOptionText: {
        fontSize: 16,
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
