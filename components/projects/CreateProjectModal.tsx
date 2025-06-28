import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { backendApi } from '@/services/backend-api';
import { CreateProjectDto, Project } from '@/types';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateProjectModalProps {
    visible: boolean;
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
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

export function CreateProjectModal({ visible, onClose, onProjectCreated }: CreateProjectModalProps) {
    const [formData, setFormData] = useState<CreateProjectDto>({
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

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: 'ACTIVE',
            priority: 'MEDIUM',
            startDate: '',
            endDate: '',
        });
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const canCreate = () => {
        return formData.name.trim() !== '' && !loading;
    };

    const handleCreate = async () => {
        if (!canCreate()) return;

        setLoading(true);
        try {
            const newProject = await backendApi.createProject(formData);

            onProjectCreated(newProject);
            handleClose();
            Alert.alert('Success', `Project "${formData.name}" created successfully!`);
        } catch (error: any) {
            console.error('Error creating project:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to create project. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

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
                        Create New Project
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
                                    value={formData.startDate}
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
                                    value={formData.endDate}
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
                                    backgroundColor: canCreate() ? colors.primary : colors.backgroundSecondary,
                                }
                            ]}
                            onPress={handleCreate}
                            disabled={!canCreate()}
                        >
                            <ThemedText style={[
                                styles.primaryButtonText,
                                { color: canCreate() ? '#FFFFFF' : colors.textSecondary }
                            ]}>
                                {loading ? 'Creating...' : 'Create Project'}
                            </ThemedText>
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
