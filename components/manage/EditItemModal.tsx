import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { backendApi } from '@/services/backend-api';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type EntityType = 'rooms' | 'places' | 'containers' | 'tags';

interface ManageItem {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    roomId?: number;
    placeId?: number;
    room?: { id: number; name: string };
    place?: { id: number; name: string };
}

interface EditItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entityType: EntityType;
    item: ManageItem | null;
    allRooms: ManageItem[];
    allPlaces: ManageItem[];
}

export function EditItemModal({
    visible,
    onClose,
    onSuccess,
    entityType,
    item,
    allRooms,
    allPlaces,
}: EditItemModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (item) {
            setName(item.name);
            setDescription(item.description || '');
            setSelectedRoomId(item.roomId || null);
            setSelectedPlaceId(item.placeId || null);
        }
    }, [item]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setSelectedRoomId(null);
        setSelectedPlaceId(null);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (entityType === 'places' && !selectedRoomId) {
            newErrors.room = 'Please select a room for this place';
        }

        if (entityType === 'containers' && !selectedPlaceId) {
            newErrors.place = 'Please select a place for this container';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const getTitle = () => {
        switch (entityType) {
            case 'rooms': return 'Edit Room';
            case 'places': return 'Edit Place';
            case 'containers': return 'Edit Container';
            case 'tags': return 'Edit Tag';
        }
    };

    const getNamePlaceholder = () => {
        switch (entityType) {
            case 'rooms': return 'Room name (e.g., Living Room)';
            case 'places': return 'Place name (e.g., Kitchen Counter)';
            case 'containers': return 'Container name (e.g., Storage Box)';
            case 'tags': return 'Tag name (e.g., Electronics)';
        }
    };

    const canSubmit = () => {
        if (!name.trim()) return false;
        if (entityType === 'places' && !selectedRoomId) return false;
        if (entityType === 'containers' && !selectedPlaceId) return false;
        return true;
    };

    const getAvailablePlaces = () => {
        if (!selectedRoomId) return [];
        return allPlaces.filter(place => place.roomId === selectedRoomId);
    };

    const handleSubmit = async () => {
        if (!validateForm() || !item) return;

        setLoading(true);
        try {
            const data: any = { name: name.trim() };

            if (entityType === 'rooms' && description.trim()) {
                data.description = description.trim();
            }

            if (entityType === 'places' && selectedRoomId) {
                data.roomId = selectedRoomId;
            }

            if (entityType === 'containers') {
                if (selectedPlaceId) data.placeId = selectedPlaceId;
                if (selectedRoomId) data.roomId = selectedRoomId;
            }

            switch (entityType) {
                case 'rooms':
                    await backendApi.updateRoom(item.id, data);
                    break;
                case 'places':
                    await backendApi.updatePlace(item.id, data);
                    break;
                case 'containers':
                    await backendApi.updateContainer(item.id, data);
                    break;
                case 'tags':
                    await backendApi.updateTag(item.id, data);
                    break;
            }

            Alert.alert('Success', `${name.trim()} has been updated successfully!`);
            onSuccess();
            resetForm();
        } catch (error: any) {
            console.error('Error updating item:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update item';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>{getTitle()}</ThemedText>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!canSubmit() || loading}
                        style={[
                            styles.saveButton,
                            {
                                backgroundColor: canSubmit() && !loading ? colors.primary : colors.textSecondary,
                                opacity: canSubmit() && !loading ? 1 : 0.5,
                            }
                        ]}
                    >
                        <ThemedText style={[styles.saveButtonText, { color: 'white' }]}>
                            {loading ? 'Saving...' : 'Save'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Name *</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    color: colors.text,
                                    borderColor: errors.name ? colors.error : colors.border,
                                    borderWidth: errors.name ? 2 : 1,
                                }
                            ]}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) {
                                    const newErrors = { ...errors };
                                    delete newErrors.name;
                                    setErrors(newErrors);
                                }
                            }}
                            placeholder={getNamePlaceholder()}
                            placeholderTextColor={colors.textSecondary}
                        />
                        {errors.name && (
                            <ThemedText style={[styles.errorText, { color: colors.error }]}>
                                {errors.name}
                            </ThemedText>
                        )}
                    </View>

                    {entityType === 'rooms' && (
                        <View style={styles.section}>
                            <ThemedText style={styles.label}>Description</ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    {
                                        backgroundColor: colors.card,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    }
                                ]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Optional description..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    )}

                    {entityType === 'places' && (
                        <View style={styles.section}>
                            <ThemedText style={styles.label}>Room *</ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.chipContainer}>
                                    {allRooms.map((room) => (
                                        <TouchableOpacity
                                            key={room.id}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: selectedRoomId === room.id
                                                        ? colors.primary
                                                        : colors.card,
                                                    borderColor: selectedRoomId === room.id
                                                        ? colors.primary
                                                        : colors.border,
                                                }
                                            ]}
                                            onPress={() => setSelectedRoomId(room.id)}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.chipText,
                                                    {
                                                        color: selectedRoomId === room.id
                                                            ? 'white'
                                                            : colors.text
                                                    }
                                                ]}
                                            >
                                                {room.name}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {entityType === 'containers' && (
                        <>
                            <View style={styles.section}>
                                <ThemedText style={styles.label}>Room</ThemedText>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.chipContainer}>
                                        {allRooms.map((room) => (
                                            <TouchableOpacity
                                                key={room.id}
                                                style={[
                                                    styles.chip,
                                                    {
                                                        backgroundColor: selectedRoomId === room.id
                                                            ? colors.primary
                                                            : colors.card,
                                                        borderColor: selectedRoomId === room.id
                                                            ? colors.primary
                                                            : colors.border,
                                                    }
                                                ]}
                                                onPress={() => {
                                                    setSelectedRoomId(room.id);
                                                    // Keep current place if it belongs to the new room
                                                    const availablePlaces = allPlaces.filter(p => p.roomId === room.id);
                                                    if (selectedPlaceId && !availablePlaces.find(p => p.id === selectedPlaceId)) {
                                                        setSelectedPlaceId(null);
                                                    }
                                                }}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.chipText,
                                                        {
                                                            color: selectedRoomId === room.id
                                                                ? 'white'
                                                                : colors.text
                                                        }
                                                    ]}
                                                >
                                                    {room.name}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            {selectedRoomId && (
                                <View style={styles.section}>
                                    <ThemedText style={styles.label}>Place</ThemedText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.chipContainer}>
                                            {getAvailablePlaces().map((place) => (
                                                <TouchableOpacity
                                                    key={place.id}
                                                    style={[
                                                        styles.chip,
                                                        {
                                                            backgroundColor: selectedPlaceId === place.id
                                                                ? colors.primary
                                                                : colors.card,
                                                            borderColor: selectedPlaceId === place.id
                                                                ? colors.primary
                                                                : colors.border,
                                                        }
                                                    ]}
                                                    onPress={() => setSelectedPlaceId(place.id)}
                                                >
                                                    <ThemedText
                                                        style={[
                                                            styles.chipText,
                                                            {
                                                                color: selectedPlaceId === place.id
                                                                    ? 'white'
                                                                    : colors.text
                                                            }
                                                        ]}
                                                    >
                                                        {place.name}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
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
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    errorText: {
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
