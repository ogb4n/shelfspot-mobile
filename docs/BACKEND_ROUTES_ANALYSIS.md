# Analyse des routes Backend - Paramètres et Profils

## 🔐 **Routes d'Authentification et Profil**

### 1. **GET /auth/profile**
- **Description**: Récupérer le profil de l'utilisateur connecté
- **Méthode**: GET
- **Authentification**: JWT Bearer Token requis
- **Réponse 200**: Profil utilisateur
- **Utilisation actuelle**: ✅ Déjà utilisé dans l'app

### 2. **PUT /auth/profile/name**
- **Description**: Mettre à jour le nom de l'utilisateur
- **Méthode**: PUT
- **Authentification**: JWT Bearer Token requis
- **Body**: `{ "name": "John Doe" }` (min 5 caractères)
- **Réponse 200**: Profil utilisateur mis à jour
- **Utilisation actuelle**: ✅ Déjà utilisé dans l'app

### 3. **POST /auth/password/reset**
- **Description**: Réinitialiser le mot de passe
- **Méthode**: POST
- **Body**: `{ "email": "user@example.com", "newPassword": "newPass123" }` (min 8 caractères)
- **Réponse 200**: Confirmation de réinitialisation
- **Utilisation actuelle**: ✅ Déjà utilisé dans l'app
- **⚠️ Note**: Pas de vérification de l'ancien mot de passe

## 👥 **Routes d'Administration (Admin uniquement)**

### 4. **GET /admin/users**
- **Description**: Lister tous les utilisateurs
- **Méthode**: GET
- **Authentification**: JWT Bearer Token + Admin
- **Réponse 200**: Liste de tous les utilisateurs
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Gestion des utilisateurs (page admin)

### 5. **POST /admin/users**
- **Description**: Créer un nouvel utilisateur
- **Méthode**: POST
- **Authentification**: JWT Bearer Token + Admin
- **Body**: `CreateUserDto` (email, password, name?, admin?)
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Création d'utilisateurs (page admin)

### 6. **PUT /admin/users/{id}**
- **Description**: Mettre à jour un utilisateur (TOUT y compris email!)
- **Méthode**: PUT
- **Authentification**: JWT Bearer Token + Admin
- **Body**: `UpdateUserDto` (email?, name?, admin?, password?)
- **Réponse 200**: Utilisateur mis à jour
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **🚀 Potentiel**: **Modification email** possible via admin!

### 7. **DELETE /admin/users/{id}**
- **Description**: Supprimer un utilisateur
- **Méthode**: DELETE
- **Authentification**: JWT Bearer Token + Admin
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Suppression d'utilisateurs (page admin)

## 🔔 **Routes de Notifications/Alertes**

### 8. **POST /alerts**
- **Description**: Créer une nouvelle alerte
- **Méthode**: POST
- **Authentification**: JWT Bearer Token requis
- **Body**: `CreateAlertDto`
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Paramètres de notifications

### 9. **GET /alerts**
- **Description**: Récupérer les alertes (optionnel: filtrer par itemId)
- **Méthode**: GET
- **Authentification**: JWT Bearer Token requis
- **Query Params**: `itemId?` (number)
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Gestion des alertes personnalisées

### 10. **PUT /alerts/{id}**
- **Description**: Mettre à jour une alerte
- **Méthode**: PUT
- **Authentification**: JWT Bearer Token requis
- **Body**: `UpdateAlertDto`
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Modification des paramètres d'alertes

### 11. **DELETE /alerts/{id}**
- **Description**: Supprimer une alerte
- **Méthode**: DELETE
- **Authentification**: JWT Bearer Token requis
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Désactiver des alertes

### 12. **POST /alerts/check**
- **Description**: Déclencher la vérification des alertes
- **Méthode**: POST
- **Authentification**: JWT Bearer Token requis
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **Potentiel**: Test manuel des notifications

### 13. **POST /alerts/test-email**
- **Description**: Envoyer un email de test
- **Méthode**: POST
- **Authentification**: JWT Bearer Token requis
- **Query Params**: `email?` (string)
- **Utilisation actuelle**: ❌ Pas encore implémenté
- **🚀 Potentiel**: **Test de configuration email** dans les paramètres!

## 📊 **Résumé des possibilités actuelles**

### ✅ **Déjà implémenté dans les paramètres**
1. Modification du nom (`PUT /auth/profile/name`)
2. Réinitialisation du mot de passe (`POST /auth/password/reset`)
3. Récupération du profil (`GET /auth/profile`)

### 🚀 **Fonctionnalités disponibles à implémenter**

#### **Pour tous les utilisateurs:**
- ✅ **Gestion des alertes personnalisées** (CRUD sur `/alerts`)
- ✅ **Test de configuration email** (`POST /alerts/test-email`)

#### **Pour les administrateurs uniquement:**
- ✅ **Modification complète du profil** including EMAIL (`PUT /admin/users/{id}`)
- ✅ **Gestion des utilisateurs** (CRUD sur `/admin/users`)
- ✅ **Création d'utilisateurs** (`POST /admin/users`)

### ❌ **Limitations identifiées**

#### 🚫 **Pour les utilisateurs normaux (non-admin) :**
1. **❌ AUCUNE route pour modifier son EMAIL** 
   - Seul l'admin peut modifier l'email via `PUT /admin/users/{id}`
   - L'utilisateur normal ne peut PAS changer son propre email

2. **❌ AUCUNE route pour changer son mot de passe de façon sécurisée**
   - Seule route disponible : `POST /auth/password/reset` 
   - ⚠️ Cette route ne vérifie PAS l'ancien mot de passe
   - ⚠️ C'est une "réinitialisation", pas un "changement"

3. **❌ Pas d'endpoints dédiés pour les préférences** de notification globales

#### ✅ **Ce qui EST disponible pour les utilisateurs normaux :**
- ✅ Modifier son nom (`PUT /auth/profile/name`)
- ✅ Voir son profil (`GET /auth/profile`) 
- ⚠️ "Réinitialiser" son mot de passe sans vérification (`POST /auth/password/reset`)

#### 🔐 **Ce qui est disponible UNIQUEMENT pour les admins :**
- ✅ Modifier l'email de N'IMPORTE QUEL utilisateur (`PUT /admin/users/{id}`)
- ✅ Modifier le mot de passe de N'IMPORTE QUEL utilisateur (`PUT /admin/users/{id}`)
- ✅ Créer/supprimer des utilisateurs

## 🎯 **Recommandations d'implémentation prioritaire**

### ⚠️ **ATTENTION - Limitations majeures à considérer :**

**🚫 Pour le PersonalInfoModal :**
- **Email** : Impossible à implémenter pour utilisateur normal (admin uniquement)
- **Mot de passe** : Seulement "réinitialisation" sans vérification de l'ancien

**✅ Ce qu'on PEUT implémenter maintenant :**

### 1. **Gestion des alertes** (Haute priorité)
- Interface pour créer/modifier/supprimer ses alertes personnalisées
- Page dédiée dans les paramètres "Mes Alertes"
- ✅ Routes disponibles : CRUD complet sur `/alerts`

### 2. **Test email** (Moyenne priorité)
- Bouton "Tester la configuration email" dans les paramètres
- ✅ Route disponible : `POST /alerts/test-email`

### 3. **Interface admin** (Si utilisateur admin)
- Page de gestion des utilisateurs
- Possibilité de modifier l'email/mot de passe des utilisateurs (via admin)
- ✅ Routes disponibles : CRUD complet sur `/admin/users`

### 4. **Amélioration des paramètres actuels** (Priorité immédiate)
- Clarifier que la modification de mot de passe = "réinitialisation"
- Supprimer l'option de modification d'email pour utilisateurs normaux
- Améliorer l'UX des fonctionnalités déjà disponibles
