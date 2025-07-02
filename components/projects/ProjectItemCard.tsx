import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { backendApi } from '../../services/backend-api';
import { ProjectItem } from '../../types';

interface ProjectItemCardProps {
    projectItem: ProjectItem;
    onRemove: () => void;
}

export function ProjectItemCard({ projectItem, onRemove }: ProjectItemCardProps) {

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
                        } catch {
                            Alert.alert('Error', 'Failed to remove item from project.');
                        }
                    },
                },
            ]
        );
    };

    const getScoreColor = (score?: number) => {
        if (!score) return colors.textSecondary;
        if (score >= 8) return '#ef4444'; // Red for high importance
        if (score >= 5) return '#f59e0b'; // Yellow for medium importance
        return '#10b981'; // Green for low importance
    };

    return (
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
                                { backgroundColor: getScoreColor(
                                    projectItem.detailedScore?.totalScore || 
                                    projectItem.importanceScore
                                ) },
                            ]}
                        >
                            <Text style={styles.scoreText}>
                                {projectItem.detailedScore?.totalScore || 
                                 projectItem.importanceScore || 1}/10
                            </Text>
                        </View>
                    </View>
                    
                    {projectItem.detailedScore?.breakdown && (
                        <View style={styles.scoreBreakdownContainer}>
                            <Text style={[styles.scoreBreakdownTitle, { color: colors.textSecondary }]}>
                                Score Breakdown:
                            </Text>
                            <View style={styles.scoreBreakdownItems}>
                                <View style={styles.scoreBreakdownItem}>
                                    <Text style={[styles.scoreBreakdownLabel, { color: colors.textSecondary }]}>
                                        Active Projects:
                                    </Text>
                                    <Text style={[styles.scoreBreakdownValue, { color: colors.text }]}>
                                        +{projectItem.detailedScore.breakdown.activeProjectsScore}
                                    </Text>
                                </View>
                                {projectItem.detailedScore.breakdown.pausedProjectsScore > 0 && (
                                    <View style={styles.scoreBreakdownItem}>
                                        <Text style={[styles.scoreBreakdownLabel, { color: colors.textSecondary }]}>
                                            Paused Projects:
                                        </Text>
                                        <Text style={[styles.scoreBreakdownValue, { color: colors.text }]}>
                                            +{projectItem.detailedScore.breakdown.pausedProjectsScore}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.scoreBreakdownItem}>
                                    <Text style={[styles.scoreBreakdownLabel, { color: colors.textSecondary }]}>
                                        Project Count Bonus:
                                    </Text>
                                    <Text style={[styles.scoreBreakdownValue, { color: colors.text }]}>
                                        +{projectItem.detailedScore.breakdown.projectCountBonus}
                                    </Text>
                                </View>
                                <View style={styles.scoreBreakdownItem}>
                                    <Text style={[styles.scoreBreakdownLabel, { color: colors.textSecondary }]}>
                                        Priority Multiplier:
                                    </Text>
                                    <Text style={[styles.scoreBreakdownValue, { color: colors.text }]}>
                                        x{projectItem.detailedScore.breakdown.priorityMultiplier}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

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
    // New styles for score breakdown
    scoreBreakdownContainer: {
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    scoreBreakdownTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    scoreBreakdownItems: {
        gap: 4,
    },
    scoreBreakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreBreakdownLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    scoreBreakdownValue: {
        fontSize: 12,
        fontWeight: '500',
    },
});
