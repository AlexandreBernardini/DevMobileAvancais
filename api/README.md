# TCG Mobile API

API REST complète pour un jeu de cartes à collectionner (TCG) mobile avec des personnages, utilisant Prisma et Express.js.

## 🚀 Fonctionnalités

### 🔐 Authentification

-   Inscription et connexion avec JWT
-   Tokens de rafraîchissement
-   Rôles utilisateurs (user, moderator, admin)
-   Middleware de protection des routes

### 🎭 Gestion des Personnages

-   CRUD complet pour les personnages
-   Système de rareté (Common → Mythic)
-   8 éléments différents
-   7 classes de personnages
-   Capacités et évolutions

### 👤 Profils Utilisateurs

-   Gestion de profil complet
-   Statistiques de jeu
-   Collection de cartes
-   Système d'amis
-   Paramètres de confidentialité

### 🏗️ Construction de Decks

-   Création et gestion de decks (30-60 cartes)
-   Formats de jeu multiples
-   Validation automatique
-   Partage de decks publics

### 🎮 Système de Jeu

-   Parties en temps réel
-   Historique des actions
-   Support pour tournois
-   Spectateurs

### 🏆 Tournois

-   Différents formats (élimination, round robin, etc.)
-   Gestion des inscriptions
-   Système de prix
-   Classements

### 🔄 Échanges

-   Échanges directs entre joueurs
-   Marketplace public
-   Système d'expiration
-   Validation automatique

### 📦 Packs de Cartes

-   Différents types de packs
-   Système de probabilités
-   Cartes garanties
-   Effets spéciaux (foil, bonus)

## 🛠️ Technologies

-   **Node.js** + **Express.js** - Serveur web
-   **Prisma** - ORM et gestion de base de données
-   **PostgreSQL** - Base de données
-   **JWT** - Authentification
-   **Joi** - Validation des données
-   **Swagger** - Documentation API
-   **bcryptjs** - Hachage des mots de passe

## 📁 Structure du Projet

```
api/
├── config/
│   └── database.js          # Configuration Prisma
├── controllers/             # Logique métier
│   ├── authController.js
│   ├── charactersController.js
│   ├── usersController.js
│   └── ...
├── middleware/              # Middleware personnalisé
│   ├── auth.js             # Authentification
│   ├── validation.js       # Validation Joi
│   ├── errorHandler.js     # Gestion d'erreurs
│   └── notFound.js
├── routes/                  # Définition des routes
│   ├── auth.js
│   ├── characters.js
│   ├── users.js
│   └── ...
├── utils/                   # Utilitaires
│   └── auth.js             # Fonctions JWT/bcrypt
├── prisma/
│   ├── schema.prisma       # Schéma de base de données
│   └── seed.js             # Données de test
├── server.js               # Point d'entrée
├── package.json
└── .env.example
```

## 🚀 Installation et Configuration

### 1. Prérequis

-   Node.js (v16+)
-   PostgreSQL
-   npm ou yarn

### 2. Installation

```bash
cd api
npm install
```

### 3. Configuration de l'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tcg_mobile"
JWT_SECRET="votre-clé-secrète-jwt"
JWT_REFRESH_SECRET="votre-clé-refresh-secrète"
PORT=3000
```

### 4. Configuration de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Remplir avec des données de test
npm run prisma:seed
```

### 5. Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 📚 Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible à :

-   **Documentation interactive** : http://localhost:3000/api-docs
-   **Health check** : http://localhost:3000/health

## 🔑 Authentification

### Inscription

```bash
POST /api/auth/register
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123",
  "displayName": "Player One"
}
```

### Connexion

```bash
POST /api/auth/login
{
  "email": "player1@example.com",
  "password": "password123"
}
```

### Utilisation du token

```bash
Authorization: Bearer <votre-token-jwt>
```

## 📊 Endpoints Principaux

### Authentification

-   `POST /api/auth/register` - Inscription
-   `POST /api/auth/login` - Connexion
-   `POST /api/auth/refresh` - Rafraîchir le token
-   `POST /api/auth/logout` - Déconnexion
-   `GET /api/auth/me` - Profil actuel

### Personnages

-   `GET /api/characters` - Liste des personnages (avec filtres)
-   `GET /api/characters/:id` - Détails d'un personnage
-   `POST /api/characters` - Créer un personnage (admin)
-   `PUT /api/characters/:id` - Modifier un personnage (admin)
-   `DELETE /api/characters/:id` - Supprimer un personnage (admin)

### Utilisateurs

-   `PUT /api/users/profile` - Mettre à jour le profil
-   `GET /api/users/:userId/collection` - Collection d'un utilisateur
-   `GET /api/users/:userId/decks` - Decks d'un utilisateur
-   `GET /api/users/leaderboard` - Classement général
-   `GET /api/users/search` - Rechercher des utilisateurs

### Decks

-   `POST /api/decks` - Créer un deck
-   `GET /api/decks/:id` - Détails d'un deck
-   `PUT /api/decks/:id` - Modifier un deck
-   `DELETE /api/decks/:id` - Supprimer un deck
-   `GET /api/decks/public` - Decks publics

### Jeux

-   `POST /api/games` - Créer une partie
-   `GET /api/games/:id` - État d'une partie
-   `POST /api/games/:id/actions` - Effectuer une action

### Tournois

-   `GET /api/tournaments` - Liste des tournois
-   `POST /api/tournaments` - Créer un tournoi (admin/mod)
-   `GET /api/tournaments/:id` - Détails d'un tournoi
-   `POST /api/tournaments/:id/join` - Rejoindre un tournoi

### Échanges

-   `GET /api/trades` - Mes échanges
-   `POST /api/trades` - Créer un échange
-   `POST /api/trades/:id/accept` - Accepter un échange

### Packs de Cartes

-   `GET /api/boosters` - Packs disponibles
-   `POST /api/boosters/:id/purchase` - Acheter un pack

## 👥 Rôles et Permissions

### User (Défaut)

-   Gérer son profil et sa collection
-   Créer des decks
-   Participer aux jeux et tournois
-   Effectuer des échanges

### Moderator

-   Tout ce que fait un User
-   Créer des tournois
-   Modérer le contenu

### Admin

-   Toutes les permissions
-   Gérer les personnages et sets
-   Gérer les utilisateurs
-   Configuration système

## 🔄 Données de Test

Le script de seed crée automatiquement :

-   1 compte admin (`admin@tcg.com` / `admin123`)
-   5 comptes joueurs (`player1@tcg.com` / `password123`)
-   2 sets de cartes avec thèmes
-   5 personnages avec capacités
-   Collections de cartes pour chaque joueur
-   Packs de cartes configurés

## 🧪 Tests et Validation

### Validation des Données

-   Toutes les entrées sont validées avec Joi
-   Messages d'erreur détaillés
-   Sanitisation automatique

### Sécurité

-   Hachage bcrypt pour les mots de passe
-   JWT avec expiration
-   Rate limiting configuré
-   Headers de sécurité avec Helmet
-   Validation des permissions sur chaque route

## 🚀 Déploiement

### Variables d'environnement de production

```env
NODE_ENV=production
DATABASE_URL="votre-url-postgresql-production"
JWT_SECRET="clé-super-secrète-production"
JWT_REFRESH_SECRET="clé-refresh-super-secrète"
FRONTEND_URL="https://votre-frontend.com"
```

### Commandes utiles

```bash
# Voir l'état de la base de données
npm run prisma:status

# Interface graphique Prisma Studio
npm run prisma:studio

# Reset de la base de données (développement uniquement)
npm run prisma:reset
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

Pour toute question ou problème :

-   Créer une issue sur GitHub
-   Consulter la documentation Swagger
-   Vérifier les logs du serveur
