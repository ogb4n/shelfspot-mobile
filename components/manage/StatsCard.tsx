import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

interface StatItem {
    label: string;
    value: number;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
}

interface StatsCardProps {
    stats: StatItem[];
    title?: string;
}

export function StatsCard({ stats, title = "Overview" }: StatsCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.container, { backgroundColor: colors.card }]}>
            {title && (
                <ThemedText style={[styles.title, { color: colors.text }]}>
                    {title}
                </ThemedText>
            )}

            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={[styles.statItem, { borderRightColor: colors.border }]}>
                        <View style={[styles.iconContainer, { backgroundColor: (stat.color || colors.primary) + '20' }]}>
                            <Ionicons
                                name={stat.icon}
                                size={20}
                                color={stat.color || colors.primary}
                            />
                        </View>
                        <ThemedText style={[styles.statNumber, { color: stat.color || colors.primary }]}>
                            {stat.value}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                            {stat.label}
                        </ThemedText>
                    </View>
                ))}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        borderRightWidth: 1,
        paddingHorizontal: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
});
