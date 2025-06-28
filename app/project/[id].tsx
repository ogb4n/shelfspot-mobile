import { EditProjectModal } from '@/components/projects';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { backendApi } from '@/services/backend-api';
import { Project } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProjectDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadProject();
        }
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            setError(null);
            const projectData = await backendApi.getProject(Number(id));
            setProject(projectData);
        } catch (err: any) {
            console.error('Error loading project:', err);
            setError(err.message || 'Failed to load project');
            // Mock data for development
            setProject({
                id: Number(id),
                name: 'Sample Project',
                description: 'This is a sample project for testing',
                status: 'ACTIVE',
                priority: 'MEDIUM',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                itemCount: 25
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditProject = () => {
        setShowEditModal(true);
    };

    const handleProjectUpdated = (updatedProject: Project) => {
        setProject(updatedProject);
    };

    const handleDeleteProject = () => {
        Alert.alert(
            'Delete Project',
            'Are you sure you want to delete this project? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await backendApi.deleteProject(Number(id));
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete project');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#22c55e';
            case 'completed': return '#3b82f6';
            case 'on-hold':
            case 'paused': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            default: return colors.tabIconDefault;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
            case 'critical': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#22c55e';
            default: return colors.tabIconDefault;
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol size={24} name="chevron.left" color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText type="title">Project Details</ThemedText>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                    <ThemedText style={styles.loadingText}>Loading project...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    if (error || !project) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol size={24} name="chevron.left" color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText type="title">Project Details</ThemedText>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <IconSymbol size={48} name="exclamationmark.triangle.fill" color={colors.error} />
                    <ThemedText style={[styles.errorText, { color: colors.error }]}>
                        {error || 'Project not found'}
                    </ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol size={24} name="chevron.left" color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Project Details</ThemedText>
                <TouchableOpacity onPress={handleEditProject} style={styles.editButton}>
                    <IconSymbol size={20} name="pencil" color={colors.tint} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Project Info Card */}
                <Card style={[styles.card, { borderColor: colors.border }] as any}>
                    <View style={styles.cardHeader}>
                        <View style={styles.projectIcon}>
                            <IconSymbol size={32} name="folder.fill" color={colors.tint} />
                        </View>
                        <View style={styles.projectInfo}>
                            <ThemedText type="subtitle" style={styles.projectName}>
                                {project.name}
                            </ThemedText>
                            {project.description && (
                                <ThemedText style={[styles.projectDescription, { color: colors.tabIconDefault }]}>
                                    {project.description}
                                </ThemedText>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Status and Priority Card */}
                <Card style={[styles.card, { borderColor: colors.border }] as any}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Status & Priority</ThemedText>
                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <ThemedText style={[styles.label, { color: colors.tabIconDefault }]}>Status</ThemedText>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status || 'ACTIVE') }]}>
                                <ThemedText style={styles.statusText}>
                                    {(project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase() : 'Active')}
                                </ThemedText>
                            </View>
                        </View>
                        <View style={styles.statusItem}>
                            <ThemedText style={[styles.label, { color: colors.tabIconDefault }]}>Priority</ThemedText>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(project.priority || 'MEDIUM') }]}>
                                <ThemedText style={styles.priorityText}>
                                    {(project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1).toLowerCase() : 'Medium')}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Dates Card */}
                {(project.startDate || project.endDate) && (
                    <Card style={[styles.card, { borderColor: colors.border }] as any}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Timeline</ThemedText>
                        <View style={styles.datesContainer}>
                            {project.startDate && (
                                <View style={styles.dateItem}>
                                    <IconSymbol size={16} name="calendar" color={colors.tabIconDefault} />
                                    <View style={styles.dateInfo}>
                                        <ThemedText style={[styles.label, { color: colors.tabIconDefault }]}>Start Date</ThemedText>
                                        <ThemedText style={styles.dateText}>
                                            {new Date(project.startDate).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                </View>
                            )}
                            {project.endDate && (
                                <View style={styles.dateItem}>
                                    <IconSymbol size={16} name="calendar" color={colors.tabIconDefault} />
                                    <View style={styles.dateInfo}>
                                        <ThemedText style={[styles.label, { color: colors.tabIconDefault }]}>End Date</ThemedText>
                                        <ThemedText style={styles.dateText}>
                                            {new Date(project.endDate).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Card>
                )}

                {/* Statistics Card */}
                <Card style={[styles.card, { borderColor: colors.border }] as any}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Statistics</ThemedText>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <IconSymbol size={24} name="cube.box.fill" color={colors.tint} />
                            <View style={styles.statInfo}>
                                <ThemedText style={styles.statValue}>{project.itemCount || 0}</ThemedText>
                                <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>Items</ThemedText>
                            </View>
                        </View>
                        <View style={styles.statItem}>
                            <IconSymbol size={24} name="calendar" color={colors.tint} />
                            <View style={styles.statInfo}>
                                <ThemedText style={styles.statValue}>
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </ThemedText>
                                <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>Created</ThemedText>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <Button
                        title="Edit Project"
                        onPress={handleEditProject}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Delete Project"
                        onPress={handleDeleteProject}
                        style={styles.deleteButton}
                    />
                </View>
            </ScrollView>

            <EditProjectModal
                visible={showEditModal}
                project={project}
                onClose={() => setShowEditModal(false)}
                onProjectUpdated={handleProjectUpdated}
            />
        </ThemedView>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        padding: 4,
    },
    editButton: {
        padding: 4,
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    projectIcon: {
        marginRight: 12,
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    projectDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusItem: {
        flex: 1,
        marginRight: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    priorityText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    datesContainer: {
        gap: 16,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInfo: {
        marginLeft: 12,
        flex: 1,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statInfo: {
        marginLeft: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    actionsContainer: {
        gap: 12,
        paddingBottom: 32,
    },
    actionButton: {
        marginHorizontal: 0,
    },
    deleteButton: {
        marginHorizontal: 0,
        backgroundColor: '#ef4444',
    },
});
