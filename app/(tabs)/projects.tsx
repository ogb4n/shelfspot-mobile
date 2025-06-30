import { CreateProjectModal, EditProjectModal } from '@/components/projects';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SkeletonList } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/Colors';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { backendApi } from '@/services/backend-api';
import { Project } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProjectsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { showError } = useToast();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const loadProjects = async () => {
        try {
            setError(null);
            const projectsData = await backendApi.getProjects();
            setProjects(projectsData);
        } catch (err: any) {
            console.error('Error loading projects:', err);
            setError(err.message || 'Failed to load projects');
            showError(err.message || 'Failed to load projects');
            // Mock data for development when backend is not available
            setProjects([
                {
                    id: 1,
                    name: 'Home Inventory',
                    description: 'Personal home items management',
                    createdAt: new Date().toISOString(),
                    itemCount: 45
                },
                {
                    id: 2,
                    name: 'Office Supplies',
                    description: 'Office equipment and supplies tracking',
                    createdAt: new Date().toISOString(),
                    itemCount: 23
                }
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProjects();
    };

    const handleProjectCreated = (newProject: Project) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    const handleProjectUpdated = (updatedProject: Project) => {
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.id === updatedProject.id ? updatedProject : project
            )
        );
    };

    const handleEditProject = (project: Project, event: any) => {
        event.stopPropagation(); // Prevent navigation
        setSelectedProject(project);
        setShowEditModal(true);
    };

    useEffect(() => {
        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderProjectCard = (project: Project) => (
        <TouchableOpacity
            key={project.id}
            onPress={() => router.push(`/project/${project.id}`)}
            activeOpacity={0.7}
        >
            <Card style={[styles.projectCard, { borderColor: colors.border }] as any}>
                <View style={styles.projectHeader}>
                    <View style={styles.projectIcon}>
                        <IconSymbol size={24} name="folder.fill" color={colors.tint} />
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
                    <View style={styles.projectActions}>
                        <TouchableOpacity
                            onPress={(event) => handleEditProject(project, event)}
                            style={styles.editButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <IconSymbol size={18} name="pencil" color={colors.tint} />
                        </TouchableOpacity>
                        <IconSymbol size={20} name="chevron.right" color={colors.tabIconDefault} />
                    </View>
                </View>

                {project.itemCount !== undefined && (
                    <View style={styles.projectStats}>
                        <View style={styles.statItem}>
                            <IconSymbol size={16} name="cube.box.fill" color={colors.tabIconDefault} />
                            <ThemedText style={[styles.statText, { color: colors.tabIconDefault }]}>
                                {project.itemCount} items
                            </ThemedText>
                        </View>
                    </View>
                )}
            </Card>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title">Projects</ThemedText>
                    <Button
                        title="New Project"
                        onPress={() => setShowCreateModal(true)}
                        style={styles.createButton}
                    />
                </View>
                <View style={styles.scrollView}>
                    <SkeletonList itemCount={3} showTags={false} />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Projects</ThemedText>
                <Button
                    title="New Project"
                    onPress={() => setShowCreateModal(true)}
                    style={styles.createButton}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.tint}
                    />
                }
            >
                {error && (
                    <Card style={[styles.errorCard, { backgroundColor: colors.background }] as any}>
                        <View style={styles.errorContent}>
                            <IconSymbol size={24} name="exclamationmark.triangle.fill" color={colors.error} />
                            <ThemedText style={[styles.errorText, { color: colors.error }]}>
                                {error}
                            </ThemedText>
                        </View>
                    </Card>
                )}

                {projects.length === 0 && !error ? (
                    <Card style={styles.emptyCard}>
                        <View style={styles.emptyContent}>
                            <IconSymbol size={48} name="folder.badge.plus" color={colors.tabIconDefault} />
                            <ThemedText type="subtitle" style={styles.emptyTitle}>
                                No projects yet
                            </ThemedText>
                            <ThemedText style={[styles.emptyDescription, { color: colors.tabIconDefault }]}>
                                Create your first project to start organizing your inventory
                            </ThemedText>
                        </View>
                    </Card>
                ) : (
                    projects.map(renderProjectCard)
                )}
            </ScrollView>

            <CreateProjectModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onProjectCreated={handleProjectCreated}
            />

            <EditProjectModal
                visible={showEditModal}
                project={selectedProject}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60, // Account for status bar
    },
    createButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
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
    },
    projectCard: {
        marginBottom: 12,
        padding: 16,
    },
    projectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    projectIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        marginBottom: 4,
    },
    projectDescription: {
        fontSize: 14,
    },
    projectActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        gap: 8,
    },
    editButton: {
        padding: 4,
        borderRadius: 6,
    },
    projectStats: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 6,
        fontSize: 14,
    },
    errorCard: {
        marginBottom: 16,
        padding: 16,
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        marginLeft: 12,
        flex: 1,
    },
    emptyCard: {
        padding: 32,
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        textAlign: 'center',
        fontSize: 14,
    },
});
