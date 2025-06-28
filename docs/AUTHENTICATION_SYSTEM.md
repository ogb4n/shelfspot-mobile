# Système d'Authentification Mobile - ShelfSpot

Ce document décrit le système d'authentification complet implémenté pour l'application mobile ShelfSpot.

## Architecture

### Services

#### 1. **ConfigService** (`/services/config.ts`)
- Gère la configuration de l'IP du serveur backend
- Stockage persistant avec AsyncStorage
- Test de connectivité au serveur

**Méthodes principales :**
- `setServerIp(ip: string)` - Définit l'IP du serveur
- `getServerIp()` - Récupère l'IP actuelle
- `testConnection()` - Test simple de connectivité
- `testConnectionDetailed()` - Test détaillé avec informations du serveur

#### 2. **BackendApiService** (`/services/backend-api.ts`)
- Interface avec l'API backend ShelfSpot
- Gestion automatique des tokens JWT
- Gestion d'erreurs robuste

**Méthodes d'authentification :**
- `login(email, password)` - Connexion utilisateur
- `register(email, password, name?)` - Inscription utilisateur  
- `getProfile()` - Récupération du profil utilisateur
- `updateProfile(name)` - Mise à jour du profil
- `resetPassword(email, newPassword)` - Réinitialisation mot de passe
- `testConnection()` - Test de connectivité au serveur

#### 3. **AuthContext** (`/contexts/AuthContext.tsx`)
- Context React pour l'état d'authentification global
- Gestion automatique de la persistance des tokens
- Initialisation automatique au démarrage

### Hooks Personnalisés

#### **useServerConnection** (`/hooks/useServerConnection.ts`)
Hook pour gérer la connectivité au serveur :
- État de connexion en temps réel
- Test de connexion avec retry automatique
- Informations détaillées du serveur

### Composants UI

#### **ConnectionStatus** (`/components/ui/ConnectionStatus.tsx`)
Composant réutilisable pour afficher l'état de connexion :
- Indicateurs visuels (icônes, couleurs)
- Affichage des informations du serveur
- Bouton de retry intégré
- Gestion des erreurs

## Écrans

### 1. **Configuration du Serveur** (`/app/server-config.tsx`)
Premier écran de configuration :
- Saisie de l'IP du serveur backend
- Test de connectivité en temps réel
- Validation avant de continuer
- Possibilité d'ignorer pour utiliser l'IP par défaut

**Fonctionnalités :**
- ✅ Validation de l'IP saisie
- ✅ Test de connexion avec timeout
- ✅ Affichage des informations du serveur (version, timestamp)
- ✅ Gestion d'erreurs détaillée
- ✅ Persistance de la configuration

### 2. **Authentification** (`/app/login.tsx`)
Écran de connexion/inscription :
- Basculement entre login et register
- Validation des champs
- Gestion d'erreurs réseau spécifiques
- Bouton d'accès à la configuration du serveur

**Fonctionnalités :**
- ✅ Connexion utilisateur
- ✅ Inscription avec validation (nom ≥ 5 caractères, mot de passe ≥ 8 caractères)
- ✅ Gestion d'erreurs détaillée (réseau, authentification, validation)
- ✅ Navigation vers la configuration du serveur
- ✅ États de chargement

## Backend - Endpoints d'Authentification

### Endpoints Disponibles

#### **GET** `/auth/test`
Test de connectivité au serveur
```json
{
  "message": "Server is running",
  "timestamp": "2025-01-27T...",
  "version": "1.0.0"
}
```

#### **POST** `/auth/login`
Connexion utilisateur
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **POST** `/auth/register`
Inscription utilisateur
```json
{
  "email": "user@example.com", 
  "password": "password123",
  "name": "John Doe" // optionnel, min 5 caractères
}
```

#### **GET** `/auth/profile`
Profil utilisateur (authentifié)
```json
Headers: { "Authorization": "Bearer <token>" }
```

#### **PUT** `/auth/profile/name`
Mise à jour du nom (authentifié)
```json
{
  "name": "Nouveau Nom"
}
```

#### **POST** `/auth/password/reset`
Réinitialisation mot de passe
```json
{
  "email": "user@example.com",
  "newPassword": "newPassword123"
}
```

## Flux d'Utilisation

### 1. Premier Démarrage
```
App Start → Server Config → Test Connection → Login → Main App
```

### 2. Démarrages Suivants
```
App Start → Check Token → Main App (si valide)
          ↓
        Login (si invalide)
```

### 3. Erreur de Connexion
```
Login Error → Check Network → Suggest Server Config → Retry
```

## Gestion d'Erreurs

### Types d'Erreurs Gérées

1. **Erreurs Réseau**
   - Serveur inaccessible
   - Timeout de connexion
   - Erreurs DNS

2. **Erreurs d'Authentification**
   - Identifiants incorrects (401)
   - Compte déjà existant (409)
   - Token expiré

3. **Erreurs de Validation**
   - Champs requis manquants
   - Format email invalide
   - Mot de passe trop court
   - Nom trop court

### Messages d'Erreur Contextuels

- **Réseau** : "Impossible de contacter le serveur. Vérifiez votre configuration réseau."
- **Serveur** : "Serveur inaccessible. Vérifiez l'adresse IP du serveur."
- **Auth** : "Email ou mot de passe incorrect"
- **Validation** : Messages spécifiques par champ

## Configuration

### Variables par Défaut
```typescript
const DEFAULT_BACKEND_URL = 'http://192.168.1.100:3001';
const STORAGE_KEY = 'backend_server_ip';
```

### Timeouts
- Test de connexion : 5 secondes
- Requêtes API : Standard fetch timeout

## Sécurité

### Stockage des Tokens
- Utilisation d'AsyncStorage (sécurisé sur mobile)
- Suppression automatique en cas d'erreur d'authentification

### Validation
- Validation côté client ET serveur
- Hash des mots de passe côté serveur (bcrypt, 12 rounds)
- Tokens JWT avec expiration (1 heure)

## Migration et Mise à Jour

Le système est conçu pour être rétrocompatible et faciliter les futures mises à jour :
- Configuration modulaire
- Services découplés
- Gestion d'erreurs centralisée
- Types TypeScript pour la sécurité

## Utilisation en Développement

1. **Démarrer le backend ShelfSpot**
2. **Configurer l'IP dans l'app mobile** (premier écran)
3. **Tester la connexion**
4. **Créer un compte ou se connecter**

Pour le développement, utilisez l'IP de votre machine locale où tourne le serveur backend.
