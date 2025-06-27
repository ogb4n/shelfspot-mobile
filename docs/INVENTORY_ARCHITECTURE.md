# Architecture de l'Inventaire Refactorisé

Cette documentation explique la nouvelle architecture modulaire de l'écran d'inventaire, basée sur le schéma Prisma fourni.

## Structure des Fichiers

### Types (`types/inventory.ts`)
Contient tous les types TypeScript basés sur le schéma Prisma :
- `User`, `Item`, `Place`, `Room`, `Tag`, `ItemTag`, `Favourite`, `Container`, `Alert`
- Types UI étendus : `ItemWithLocation`, `ItemFormData`, `FilterOptions`, etc.
- Types de statut et énumérations

### Constantes (`constants/inventory.ts`)
Définit les constantes utilisées dans l'application :
- `ITEM_STATUSES` : Configuration des statuts avec couleurs
- `FILTER_CHIPS` : Configuration des filtres principaux
- `ADD_ITEM_STEPS` : Étapes du wizard d'ajout
- Constantes de configuration (délais, seuils, etc.)

### Utilitaires (`utils/inventory/`)

#### `filters.ts`
Fonctions pour le filtrage et la recherche :
- `filterItems()` : Filtre principal pour les éléments
- `getStatusColor()`, `getStatusText()` : Helpers pour les statuts
- `getUniqueRooms()`, `getUniquePlaces()`, etc. : Extraction de valeurs uniques
- `hasActiveAdvancedFilters()` : Vérification des filtres actifs

#### `alerts.ts`
Logique de gestion des alertes :
- `isAlertTriggered()` : Vérifie si une alerte doit se déclencher
- `getTriggeredAlerts()` : Récupère toutes les alertes déclenchées
- `hasActiveAlerts()` : Vérifie si un élément a des alertes actives
- Helpers pour les messages et le tri des alertes

#### `transforms.ts`
Transformation des données Prisma vers l'UI :
- `transformItemToItemWithLocation()` : Convertit les données Prisma
- `calculateTotalValue()` : Calculs de valeurs
- `getItemStats()` : Statistiques globales

### Hooks (`hooks/inventory/`)

#### `useInventoryItems.ts`
Hook principal pour la gestion des éléments :
- État des éléments et filtres
- Recherche avec debouncing
- Opérations CRUD sur les éléments
- Gestion des filtres avancés

#### `useInventorySelection.ts`
Gestion du mode sélection :
- État de sélection multiple
- Fonctions de sélection/désélection
- Gestion du mode sélection

#### `useInventoryAlerts.ts`
Gestion des alertes :
- État des modales d'alertes
- Formulaire de création d'alertes
- Opérations CRUD sur les alertes

### Composants (`components/inventory/`)

#### `InventoryHeader.tsx`
En-tête avec actions principales :
- Titre et boutons d'actions
- Mode sélection avec compteur
- Badge d'alertes

#### `InventorySearch.tsx`
Barre de recherche :
- Input de recherche
- Toggle des filtres avancés
- Indicateur de filtres actifs

#### `InventoryFilters.tsx`
Système de filtres :
- Filtres rapides (chips)
- Filtres avancés pliables
- Sections par catégorie (pièces, endroits, etc.)

#### `InventoryItem.tsx`
Affichage d'un élément :
- Informations principales
- Indicateurs visuels (statut, alertes, favoris)
- Mode sélection avec checkbox
- Actions (alertes, favoris)

## Utilisation

### Import simplifié via les index
```typescript
// Hooks
import { useInventoryItems, useInventorySelection, useInventoryAlerts } from '../../hooks/inventory';

// Composants
import { InventoryHeader, InventorySearch, InventoryFilters, InventoryItem } from '../../components/inventory';

// Utilitaires
import { filterItems, hasActiveAlerts, transformItemToItemWithLocation } from '../../utils/inventory';
```

### Exemple d'utilisation des hooks
```typescript
function InventoryScreen() {
  // Gestion des éléments et filtres
  const {
    items,
    filteredItems,
    searchQuery,
    setSearchQuery,
    toggleAdvancedFilter,
    // ...
  } = useInventoryItems();

  // Gestion de la sélection
  const {
    isSelectionMode,
    selectedItems,
    handleItemSelection,
    toggleSelectionMode,
    // ...
  } = useInventorySelection();

  // Gestion des alertes
  const {
    triggeredAlerts,
    openCreateAlertModal,
    // ...
  } = useInventoryAlerts(items);

  return (
    // JSX utilisant les composants refactorisés
  );
}
```

## Mapping avec le Schéma Prisma

### Relations gérées
- `Item` ↔ `Room`, `Place`, `Container` : Localisation hiérarchique
- `Item` ↔ `Tag` via `ItemTag` : Système de tags
- `Item` ↔ `User` via `Favourite` : Favoris par utilisateur
- `Item` ↔ `Alert` : Alertes de stock

### Transformations
Les données Prisma sont transformées pour l'UI :
- `location` : Chaîne construite à partir de room → place → container
- `tags` : Array extrait des relations ItemTag
- `isFavorite` : Booléen calculé selon l'utilisateur actuel
- `activeAlerts` : Alertes filtrées et actives

## Extensibilité

### Ajout de nouveaux filtres
1. Étendre `FilterOptions` dans `types/inventory.ts`
2. Ajouter la logique dans `utils/inventory/filters.ts`
3. Mettre à jour `InventoryFilters.tsx`

### Nouveaux types d'alertes
1. Étendre `Alert` si nécessaire
2. Ajouter la logique dans `utils/inventory/alerts.ts`
3. Mettre à jour les composants de gestion des alertes

### Nouveaux hooks
Créer dans `hooks/inventory/` et exporter via `index.ts`

## TODO - Fonctionnalités manquantes

1. **Modales** : Créer les composants pour :
   - `AddItemModal` : Wizard d'ajout d'élément
   - `AlertsModal` : Vue d'ensemble des alertes
   - `CreateAlertModal` : Création d'alertes

2. **API Integration** : Remplacer les données mockées par de vrais appels API

3. **Optimisations** : 
   - Virtualisation pour les grandes listes
   - Memoization des composants
   - Optimistic updates

4. **Tests** : Ajouter des tests unitaires pour les hooks et utilitaires

Cette architecture modulaire améliore la maintenabilité, la testabilité et la réutilisabilité du code tout en respectant les meilleures pratiques React Native et TypeScript.
