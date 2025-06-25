import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, TextInput, FlatList, Modal, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  room: string;
  place: string;
  container: string;
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  image?: string;
  tags: string[];
  isFavorite: boolean;
}

interface AdvancedFilters {
  rooms: string[];
  places: string[];
  containers: string[];
  tags: string[];
  statuses: string[];
}

interface NewItemData {
  name: string;
  quantity: number;
  room: string;
  place: string;
  container: string;
  tags: string[];
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  isFavorite: boolean;
}

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    rooms: [],
    places: [],
    containers: [],
    tags: [],
    statuses: [],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [newItemData, setNewItemData] = useState<NewItemData>({
    name: '',
    quantity: 1,
    room: '',
    place: '',
    container: '',
    tags: [],
    status: 'available',
    isFavorite: false,
  });
  const [tempTag, setTempTag] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Dentifrice Colgate',
      quantity: 2,
      location: 'Salle de bain → Armoire → Étagère du haut',
      room: 'Salle de bain',
      place: 'Armoire',
      container: 'Étagère du haut',
      status: 'running_low',
      tags: ['hygiène', 'consommable'],
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Yaourts nature',
      quantity: 0,
      location: 'Cuisine → Réfrigérateur → Étagère du milieu',
      room: 'Cuisine',
      place: 'Réfrigérateur',
      container: 'Étagère du milieu',
      status: 'out_of_stock',
      tags: ['nourriture', 'périssable'],
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Piles AA',
      quantity: 8,
      location: 'Bureau → Tiroir → Compartiment électronique',
      room: 'Bureau',
      place: 'Tiroir',
      container: 'Compartiment électronique',
      status: 'available',
      tags: ['électronique', 'utile'],
      isFavorite: true,
    },
  ]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters = [
    { key: 'all', label: 'Tous', icon: 'square.grid.2x2' as const },
    { key: 'available', label: 'Disponible', icon: 'checkmark.circle' as const },
    { key: 'running_low', label: 'Stock faible', icon: 'exclamationmark.triangle' as const },
    { key: 'out_of_stock', label: 'Épuisé', icon: 'xmark.circle' as const },
    { key: 'favorites', label: 'Favoris', icon: 'heart' as const },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'running_low': return colors.warning;
      case 'out_of_stock': return colors.error;
      case 'expired': return '#805AD5';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'running_low': return 'Stock faible';
      case 'out_of_stock': return 'Épuisé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  // Selection functions
  const handleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleDeleteSelected = () => {
    setItems(items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  // Get unique values for filter options
  const getUniqueRooms = () => [...new Set(items.map(item => item.room))];
  const getUniquePlaces = () => [...new Set(items.map(item => item.place))];
  const getUniqueContainers = () => [...new Set(items.map(item => item.container))];
  const getUniqueTags = () => [...new Set(items.flatMap(item => item.tags))];
  const getUniqueStatuses = () => [...new Set(items.map(item => item.status))];

  // Advanced filter functions
  const toggleAdvancedFilter = (category: keyof AdvancedFilters, value: string) => {
    setAdvancedFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [category]: newValues };
    });
  };

  const clearAllAdvancedFilters = () => {
    setAdvancedFilters({
      rooms: [],
      places: [],
      containers: [],
      tags: [],
      statuses: [],
    });
  };

  const hasActiveAdvancedFilters = () => {
    return Object.values(advancedFilters).some(arr => arr.length > 0);
  };

  // Wizard functions
  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(0);
    setNewItemData({
      name: '',
      quantity: 1,
      room: '',
      place: '',
      container: '',
      tags: [],
      status: 'available',
      isFavorite: false,
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(0);
    setTempTag('');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateNewItemData = (field: keyof NewItemData, value: any) => {
    setNewItemData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tempTag.trim() && !newItemData.tags.includes(tempTag.trim())) {
      updateNewItemData('tags', [...newItemData.tags, tempTag.trim()]);
      setTempTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateNewItemData('tags', newItemData.tags.filter(tag => tag !== tagToRemove));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return newItemData.name.trim() !== '';
      case 1: return newItemData.room.trim() !== '' && newItemData.place.trim() !== '' && newItemData.container.trim() !== '';
      case 2: return true; // Tags and status are optional
      case 3: return true; // Final step
      default: return false;
    }
  };

  const addNewItem = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: newItemData.name,
      quantity: newItemData.quantity,
      location: `${newItemData.room} → ${newItemData.place} → ${newItemData.container}`,
      room: newItemData.room,
      place: newItemData.place,
      container: newItemData.container,
      status: newItemData.status,
      tags: newItemData.tags,
      isFavorite: newItemData.isFavorite,
    };

    setItems(prev => [...prev, newItem]);
    closeAddModal();
    Alert.alert('Succès', 'L\'objet a été ajouté à votre inventaire !');
  };

  const steps = [
    { title: 'Informations de base', description: 'Nom et quantité' },
    { title: 'Localisation', description: 'Pièce, endroit et contenant' },
    { title: 'Détails', description: 'Tags et statut' },
    { title: 'Confirmation', description: 'Vérifiez les informations' },
  ];

  // Filter function
  const filteredItems = items.filter((item) => {
    // Search filter with debounced query
    const matchesSearch = debouncedSearchQuery === '' || 
                         item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    
    // Basic status filter
    let matchesFilter = true;
    if (selectedFilter === 'favorites') {
      matchesFilter = item.isFavorite;
    } else if (selectedFilter !== 'all') {
      matchesFilter = item.status === selectedFilter;
    }

    // Advanced filters
    const matchesAdvancedFilters = 
      (advancedFilters.rooms.length === 0 || advancedFilters.rooms.includes(item.room)) &&
      (advancedFilters.places.length === 0 || advancedFilters.places.includes(item.place)) &&
      (advancedFilters.containers.length === 0 || advancedFilters.containers.includes(item.container)) &&
      (advancedFilters.tags.length === 0 || advancedFilters.tags.some(tag => item.tags.includes(tag))) &&
      (advancedFilters.statuses.length === 0 || advancedFilters.statuses.includes(item.status));
    
    return matchesSearch && matchesFilter && matchesAdvancedFilters;
  });

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity 
      style={[
        styles.itemCard, 
        { backgroundColor: colors.card },
        isSelectionMode && selectedItems.includes(item.id) && { borderColor: colors.primary, borderWidth: 2 }
      ]}
      onPress={() => isSelectionMode ? handleItemSelection(item.id) : undefined}
    >
      {isSelectionMode && (
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox, 
            { 
              backgroundColor: selectedItems.includes(item.id) ? colors.primary : 'transparent',
              borderColor: selectedItems.includes(item.id) ? colors.primary : colors.textSecondary 
            }
          ]}>
            {selectedItems.includes(item.id) && (
              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </View>
      )}
      
      <View style={[styles.itemContent, isSelectionMode && styles.itemContentWithCheckbox]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
              {item.location}
            </ThemedText>
          </View>
          {!isSelectionMode && (
            <TouchableOpacity style={styles.favoriteButton}>
              <IconSymbol 
                name={item.isFavorite ? "heart.fill" : "heart"} 
                size={20} 
                color={item.isFavorite ? colors.error : colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.quantityContainer}>
            <ThemedText style={[styles.quantityLabel, { color: colors.textSecondary }]}>
              Quantité:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={[styles.quantity, { color: colors.text }]}>
              {item.quantity}
            </ThemedText>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <>
            <View style={styles.selectionHeader}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleToggleSelectionMode}
              >
                <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold" style={[styles.selectionTitle, { color: colors.text }]}>
                {selectedItems.length} sélectionné{selectedItems.length > 1 ? 's' : ''}
              </ThemedText>
              <TouchableOpacity 
                style={styles.selectAllButton} 
                onPress={handleSelectAll}
              >
                <ThemedText style={[styles.selectAllText, { color: colors.primary }]}>
                  {selectedItems.length === filteredItems.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
              Inventaire
            </ThemedText>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={handleToggleSelectionMode}
              >
                <IconSymbol name="checkmark.circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={openAddModal}
              >
                <IconSymbol name="plus" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Delete Button (visible in selection mode) */}
      {isSelectionMode && selectedItems.length > 0 && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={handleDeleteSelected}
          >
            <IconSymbol name="trash" size={20} color="#FFFFFF" />
            <ThemedText style={styles.deleteButtonText}>
              Supprimer ({selectedItems.length})
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher un objet..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          <IconSymbol 
            name={showAdvancedFilters ? "chevron.up" : "slider.horizontal.3"} 
            size={20} 
            color={hasActiveAdvancedFilters() ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <View style={[styles.advancedFiltersContainer, { backgroundColor: colors.card }]}>
          <View style={styles.advancedFiltersHeader}>
            <ThemedText type="defaultSemiBold" style={[styles.advancedFiltersTitle, { color: colors.text }]}>
              Filtres avancés
            </ThemedText>
            {hasActiveAdvancedFilters() && (
              <TouchableOpacity onPress={clearAllAdvancedFilters}>
                <ThemedText style={[styles.clearFiltersText, { color: colors.primary }]}>
                  Effacer tout
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Room Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>
              Pièces
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {getUniqueRooms().map((room) => (
                  <TouchableOpacity
                    key={room}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: advancedFilters.rooms.includes(room) 
                          ? colors.primary 
                          : colors.backgroundSecondary,
                      }
                    ]}
                    onPress={() => toggleAdvancedFilter('rooms', room)}
                  >
                    <ThemedText style={[
                      styles.filterOptionText,
                      { 
                        color: advancedFilters.rooms.includes(room) 
                          ? '#FFFFFF' 
                          : colors.textSecondary 
                      }
                    ]}>
                      {room}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Place Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>
              Endroits
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {getUniquePlaces().map((place) => (
                  <TouchableOpacity
                    key={place}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: advancedFilters.places.includes(place) 
                          ? colors.primary 
                          : colors.backgroundSecondary,
                      }
                    ]}
                    onPress={() => toggleAdvancedFilter('places', place)}
                  >
                    <ThemedText style={[
                      styles.filterOptionText,
                      { 
                        color: advancedFilters.places.includes(place) 
                          ? '#FFFFFF' 
                          : colors.textSecondary 
                      }
                    ]}>
                      {place}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Container Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>
              Contenants
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {getUniqueContainers().map((container) => (
                  <TouchableOpacity
                    key={container}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: advancedFilters.containers.includes(container) 
                          ? colors.primary 
                          : colors.backgroundSecondary,
                      }
                    ]}
                    onPress={() => toggleAdvancedFilter('containers', container)}
                  >
                    <ThemedText style={[
                      styles.filterOptionText,
                      { 
                        color: advancedFilters.containers.includes(container) 
                          ? '#FFFFFF' 
                          : colors.textSecondary 
                      }
                    ]}>
                      {container}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tags Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>
              Tags
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {getUniqueTags().map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: advancedFilters.tags.includes(tag) 
                          ? colors.primary 
                          : colors.backgroundSecondary,
                      }
                    ]}
                    onPress={() => toggleAdvancedFilter('tags', tag)}
                  >
                    <ThemedText style={[
                      styles.filterOptionText,
                      { 
                        color: advancedFilters.tags.includes(tag) 
                          ? '#FFFFFF' 
                          : colors.textSecondary 
                      }
                    ]}>
                      {tag}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>
              Statuts
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {getUniqueStatuses().map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: advancedFilters.statuses.includes(status) 
                          ? colors.primary 
                          : colors.backgroundSecondary,
                      }
                    ]}
                    onPress={() => toggleAdvancedFilter('statuses', status)}
                  >
                    <ThemedText style={[
                      styles.filterOptionText,
                      { 
                        color: advancedFilters.statuses.includes(status) 
                          ? '#FFFFFF' 
                          : colors.textSecondary 
                      }
                    ]}>
                      {getStatusText(status)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilter === filter.key ? colors.primary : colors.backgroundSecondary,
              }
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <IconSymbol 
              name={filter.icon} 
              size={16} 
              color={selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary} 
            />
            <ThemedText style={[
              styles.filterText,
              { color: selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory List */}
      <FlatList
        data={filteredItems}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openAddModal}
      >
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Item Wizard Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAddModal}
      >
        <ThemedView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.backgroundSecondary }]}>
            <TouchableOpacity onPress={closeAddModal} style={styles.modalCloseButton}>
              <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <ThemedText type="defaultSemiBold" style={[styles.modalTitle, { color: colors.text }]}>
              Ajouter un objet
            </ThemedText>
            <View style={styles.modalHeaderSpace} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.progressStep}>
                <View style={[
                  styles.progressCircle,
                  {
                    backgroundColor: index <= currentStep ? colors.primary : colors.backgroundSecondary,
                    borderColor: index <= currentStep ? colors.primary : colors.textSecondary,
                  }
                ]}>
                  {index < currentStep ? (
                    <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <ThemedText style={[
                      styles.progressNumber,
                      { color: index <= currentStep ? '#FFFFFF' : colors.textSecondary }
                    ]}>
                      {index + 1}
                    </ThemedText>
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.progressLine,
                    { backgroundColor: index < currentStep ? colors.primary : colors.backgroundSecondary }
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Step Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepContainer}>
              <ThemedText type="title" style={[styles.stepTitle, { color: colors.text }]}>
                {steps[currentStep].title}
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                {steps[currentStep].description}
              </ThemedText>

              {/* Step 0: Basic Information */}
              {currentStep === 0 && (
                <View style={styles.stepContent}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Nom de l&apos;objet *
                    </ThemedText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                      placeholder="Ex: Dentifrice Colgate"
                      placeholderTextColor={colors.textSecondary}
                      value={newItemData.name}
                      onChangeText={(text) => updateNewItemData('name', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Quantité
                    </ThemedText>
                    <View style={styles.modalQuantityContainer}>
                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => updateNewItemData('quantity', Math.max(0, newItemData.quantity - 1))}
                      >
                        <IconSymbol name="minus" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.quantityInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                        value={newItemData.quantity.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text) || 0;
                          updateNewItemData('quantity', Math.max(0, num));
                        }}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => updateNewItemData('quantity', newItemData.quantity + 1)}
                      >
                        <IconSymbol name="plus" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Step 1: Location */}
              {currentStep === 1 && (
                <View style={styles.stepContent}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Pièce *
                    </ThemedText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                      placeholder="Ex: Cuisine, Salle de bain"
                      placeholderTextColor={colors.textSecondary}
                      value={newItemData.room}
                      onChangeText={(text) => updateNewItemData('room', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Endroit *
                    </ThemedText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                      placeholder="Ex: Réfrigérateur, Armoire"
                      placeholderTextColor={colors.textSecondary}
                      value={newItemData.place}
                      onChangeText={(text) => updateNewItemData('place', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Contenant *
                    </ThemedText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                      placeholder="Ex: Étagère du haut, Tiroir"
                      placeholderTextColor={colors.textSecondary}
                      value={newItemData.container}
                      onChangeText={(text) => updateNewItemData('container', text)}
                    />
                  </View>
                </View>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <View style={styles.stepContent}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Tags
                    </ThemedText>
                    <View style={styles.tagInputContainer}>
                      <TextInput
                        style={[styles.tagInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                        placeholder="Ajouter un tag"
                        placeholderTextColor={colors.textSecondary}
                        value={tempTag}
                        onChangeText={setTempTag}
                        onSubmitEditing={addTag}
                      />
                      <TouchableOpacity
                        style={[styles.addTagButton, { backgroundColor: colors.primary }]}
                        onPress={addTag}
                      >
                        <IconSymbol name="plus" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {newItemData.tags.length > 0 && (
                      <View style={styles.tagsDisplay}>
                        {newItemData.tags.map((tag, index) => (
                          <View key={index} style={[styles.tagChip, { backgroundColor: colors.primary }]}>
                            <ThemedText style={styles.tagChipText}>{tag}</ThemedText>
                            <TouchableOpacity onPress={() => removeTag(tag)}>
                              <IconSymbol name="xmark" size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Statut
                    </ThemedText>
                    <View style={styles.statusButtons}>
                      {(['available', 'running_low', 'out_of_stock', 'expired'] as const).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            {
                              backgroundColor: newItemData.status === status ? colors.primary : colors.backgroundSecondary,
                            }
                          ]}
                          onPress={() => updateNewItemData('status', status)}
                        >
                          <ThemedText style={[
                            styles.statusButtonText,
                            { color: newItemData.status === status ? '#FFFFFF' : colors.textSecondary }
                          ]}>
                            {getStatusText(status)}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.favoriteToggle}
                    onPress={() => updateNewItemData('isFavorite', !newItemData.isFavorite)}
                  >
                    <IconSymbol 
                      name={newItemData.isFavorite ? "heart.fill" : "heart"} 
                      size={20} 
                      color={newItemData.isFavorite ? colors.error : colors.textSecondary} 
                    />
                    <ThemedText style={[styles.favoriteText, { color: colors.text }]}>
                      Ajouter aux favoris
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <View style={styles.stepContent}>
                  <View style={[styles.confirmationCard, { backgroundColor: colors.card }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.confirmationTitle, { color: colors.text }]}>
                      {newItemData.name}
                    </ThemedText>
                    
                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Quantité:
                      </ThemedText>
                      <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                        {newItemData.quantity}
                      </ThemedText>
                    </View>

                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Localisation:
                      </ThemedText>
                      <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                        {newItemData.room} → {newItemData.place} → {newItemData.container}
                      </ThemedText>
                    </View>

                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Statut:
                      </ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(newItemData.status)}20` }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(newItemData.status) }]}>
                          {getStatusText(newItemData.status)}
                        </ThemedText>
                      </View>
                    </View>

                    {newItemData.tags.length > 0 && (
                      <View style={styles.confirmationRow}>
                        <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                          Tags:
                        </ThemedText>
                        <View style={styles.tagsContainer}>
                          {newItemData.tags.map((tag, index) => (
                            <View key={index} style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}>
                              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>
                                {tag}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {newItemData.isFavorite && (
                      <View style={styles.favoriteIndicator}>
                        <IconSymbol name="heart.fill" size={16} color={colors.error} />
                        <ThemedText style={[styles.favoriteIndicatorText, { color: colors.text }]}>
                          Ajouté aux favoris
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={[styles.modalFooter, { borderTopColor: colors.backgroundSecondary }]}>
            <View style={styles.modalButtons}>
              {currentStep > 0 && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.secondaryButton, { borderColor: colors.textSecondary }]}
                  onPress={prevStep}
                >
                  <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                    Précédent
                  </ThemedText>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.primaryButton, 
                  { 
                    backgroundColor: canProceedToNextStep() ? colors.primary : colors.backgroundSecondary,
                    flex: currentStep === 0 ? 1 : 0.6
                  }
                ]}
                onPress={currentStep === 3 ? addNewItem : nextStep}
                disabled={!canProceedToNextStep()}
              >
                <ThemedText style={[
                  styles.primaryButtonText, 
                  { color: canProceedToNextStep() ? '#FFFFFF' : colors.textSecondary }
                ]}>
                  {currentStep === 3 ? 'Ajouter l&apos;objet' : 'Suivant'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    minHeight: 40,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  itemContent: {
    flex: 1,
  },
  itemContentWithCheckbox: {
    paddingLeft: 40,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    lineHeight: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityLabel: {
    fontSize: 14,
  },
  quantity: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Selection mode styles
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  cancelButton: {
    padding: 8,
  },
  selectionTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  selectAllButton: {
    padding: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Advanced filters styles
  advancedFiltersContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advancedFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedFiltersTitle: {
    fontSize: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal and wizard styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
  },
  modalHeaderSpace: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  modalContent: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  stepContent: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  modalQuantityContainer: {
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
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  favoriteText: {
    fontSize: 16,
  },
  confirmationCard: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmationTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  favoriteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  favoriteIndicatorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
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
