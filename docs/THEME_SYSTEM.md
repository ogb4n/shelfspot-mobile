# Système de Thèmes - Documentation

## 🎨 Vue d'ensemble

Le système de thèmes de ShelfSpot permet aux utilisateurs de choisir entre trois modes d'affichage :
- **Light** : Thème clair permanent
- **Dark** : Thème sombre permanent  
- **Automatic** : Suit automatiquement le réglage système

## 🏗️ Architecture

### Store Zustand (`stores/theme.ts`)
```typescript
interface ThemeState {
  themeMode: 'light' | 'dark' | 'auto'     // Préférence utilisateur
  resolvedTheme: 'light' | 'dark'          // Thème effectif appliqué
  
  setThemeMode: (mode) => void              // Changer la préférence
  getResolvedTheme: () => ResolvedTheme     // Obtenir le thème résolu
  updateResolvedTheme: () => void           // Mettre à jour selon système
}
```

### Fonctionnalités
- ✅ **Persistance** avec AsyncStorage
- ✅ **Écoute système** pour le mode automatique
- ✅ **Résolution automatique** des thèmes
- ✅ **Hot reload** des changements système

## 🔧 Composants

### 1. `ThemeSelector` - Sélecteur de thème
```tsx
<ThemeSelector onThemeChange={(theme) => console.log(theme)} />
```

**Fonctionnalités :**
- Interface intuitive avec icônes
- Indication visuelle de la sélection
- Descriptions pour chaque mode
- Callback de changement

### 2. `ThemeModal` - Modale de sélection
```tsx
<ThemeModal 
  visible={show}
  onClose={() => setShow(false)}
  onThemeChange={(theme) => handleChange(theme)}
/>
```

**Fonctionnalités :**
- Présentation en mode "pageSheet"
- Header avec titre et bouton fermer
- Intègre le ThemeSelector

## 🎯 Utilisation

### Hooks disponibles

#### `useColorScheme()` - Hook principal
```typescript
import { useColorScheme } from '@/hooks/useColorScheme';

function MyComponent() {
  const colorScheme = useColorScheme(); // 'light' | 'dark'
  const colors = Colors[colorScheme];
  
  return <View style={{ backgroundColor: colors.background }} />;
}
```

#### `useTheme()` - Hook direct du store
```typescript
import { useTheme } from '@/stores/theme';

function MyComponent() {
  const theme = useTheme(); // 'light' | 'dark'
  // Équivalent à useColorScheme()
}
```

#### `useThemeMode()` - Gestion des préférences
```typescript
import { useThemeMode } from '@/stores/theme';

function SettingsComponent() {
  const { themeMode, setThemeMode } = useThemeMode();
  
  return (
    <Button onPress={() => setThemeMode('dark')}>
      Current: {themeMode}
    </Button>
  );
}
```

## 🔄 Intégration

### 1. Dans les composants existants
```typescript
// Avant
const colorScheme = useColorScheme() ?? 'light';

// Après (inchangé - compatibilité garantie)
const colorScheme = useColorScheme() ?? 'light';
```

### 2. Dans AppInitializer
```typescript
// Initialisation du listener système
useEffect(() => {
  initializeThemeListener();
  return () => cleanupThemeListener();
}, []);
```

### 3. Dans les paramètres
```typescript
// Section thème avec modale
<SettingItem
  title="Theme"
  subtitle={getThemeLabel()}
  onPress={() => setShowThemeModal(true)}
/>
```

## 📱 Comportement

### Mode Light
- Force le thème clair en permanence
- Ignore les changements système
- Icône : ☀️ (sun.max)

### Mode Dark  
- Force le thème sombre en permanence
- Ignore les changements système
- Icône : 🌙 (moon)

### Mode Automatic
- Suit les réglages système iOS/Android
- Écoute les changements en temps réel
- Icône : ◗ (circle.lefthalf.filled)
- **Par défaut** pour les nouveaux utilisateurs

## 🔧 Configuration technique

### Persistance
```typescript
// Seule la préférence utilisateur est persistée
partialize: (state) => ({ 
  themeMode: state.themeMode  // 'auto', 'light', 'dark'
});

// Le thème résolu est recalculé au démarrage
onRehydrateStorage: () => (state) => {
  state?.updateResolvedTheme();
};
```

### Listener système
```typescript
// Écoute des changements iOS/Android
Appearance.addChangeListener(({ colorScheme }) => {
  if (store.themeMode === 'auto') {
    store.updateResolvedTheme();
  }
});
```

## 🎉 Avantages

### ✨ User Experience
- **Choix utilisateur** respecté
- **Transitions fluides** entre thèmes
- **Respect des préférences système**
- **Interface intuitive** de sélection

### 🛠️ Developer Experience
- **API inchangée** - compatibilité totale
- **Store centralisé** - état cohérent
- **TypeScript complet** - sécurité des types
- **Hot reload** - développement facilité

### 📱 Performance
- **Persistance optimisée** - seules les préférences
- **Listeners intelligents** - mode auto uniquement
- **Résolution on-demand** - calcul minimal
- **Cleanup automatique** - pas de fuites mémoire

## 🚀 Migration

### Phase 1 : ✅ Complétée
- Store de thème créé
- Hooks de compatibilité maintenus
- Composants ThemeSelector/ThemeModal
- Intégration dans les paramètres

### Phase 2 : Utilisation
- L'utilisateur peut maintenant :
  - Choisir son thème préféré
  - Basculer entre les modes
  - Utiliser le mode automatique
  - Voir les changements instantanément

### Impact : Zéro breaking change !
- Tous les composants existants fonctionnent
- L'API `useColorScheme()` est préservée
- Les couleurs s'appliquent automatiquement
- Migration transparente

Le système de thèmes est maintenant **fonctionnel, intuitif et robuste** ! 🎨✨
