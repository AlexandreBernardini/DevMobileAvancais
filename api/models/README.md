# Modèle de Données - TCG Mobile API

Ce document décrit le modèle de données pour l'API d'un jeu de cartes à collectionner (TCG) mobile avec des personnages.

## Vue d'ensemble de l'architecture

Le modèle de données est conçu pour supporter un TCG complet avec les fonctionnalités suivantes :

-   Gestion des personnages et cartes
-   Système de collection utilisateur
-   Construction et gestion de decks
-   Système de jeu en temps réel
-   Tournois et compétitions
-   Échanges entre joueurs
-   Packs de cartes et économie

## Modèles principaux

### 1. Character (Personnage)

Représente une carte de personnage dans le jeu.

**Caractéristiques principales :**

-   Statistiques de combat (santé, attaque, défense, vitesse, mana)
-   Système d'éléments (Fire, Water, Earth, Air, Lightning, Dark, Light, Neutral)
-   Classes de personnages (Warrior, Mage, Archer, Assassin, Healer, Tank, Support)
-   Système de rareté (Common, Uncommon, Rare, Epic, Legendary, Mythic)
-   Capacités spéciales avec coût en mana
-   Système d'évolution
-   Visuels (image de carte, portrait, artwork complet)

### 2. Set (Extension)

Représente une extension ou collection de cartes.

**Caractéristiques principales :**

-   Informations de base (nom, code, description, thème)
-   Distribution des raretés
-   Configuration des packs de cartes
-   Gestion des dates de sortie et disponibilité

### 3. User (Utilisateur)

Profil complet du joueur.

**Sections principales :**

-   **Profil** : informations personnelles, niveau, expérience
-   **Statistiques de jeu** : victoires, défaites, classement, ligue
-   **Collection** : nombre de cartes, sets complétés, favoris
-   **Économie** : pièces, gemmes, poussière d'artisanat
-   **Social** : amis, paramètres de confidentialité

### 4. UserCard (Carte Utilisateur)

Représente une carte spécifique dans la collection d'un utilisateur.

**Caractéristiques :**

-   Lien vers le personnage et l'utilisateur
-   Quantité possédée
-   État de la carte (Mint, Near Mint, etc.)
-   Niveau et expérience de la carte
-   Métadonnées (source d'obtention, usage, etc.)

### 5. Deck (Deck)

Construction de deck par les joueurs.

**Fonctionnalités :**

-   30-60 cartes par deck
-   Maximum 3 copies par carte
-   Système de format (Standard, Classic, Limited, Custom)
-   Statistiques de performance
-   Partage et système de likes
-   Validation automatique de légalité

### 6. Game (Partie)

Gestion complète des parties en cours.

**Système de jeu :**

-   Support pour 2 joueurs
-   État de jeu détaillé (main, terrain, cimetière)
-   Système de tours et d'actions
-   Historique des actions
-   Support pour spectateurs
-   Intégration tournois

### 7. Tournament (Tournoi)

Système de tournois complet.

**Types supportés :**

-   Élimination simple/double
-   Round Robin
-   Système Suisse

**Fonctionnalités :**

-   Gestion des inscriptions
-   Système de prix
-   Génération automatique des matchs
-   Suivi de progression

### 8. Trade (Échange)

Système d'échange entre joueurs.

**Types d'échanges :**

-   Échanges directs
-   Échanges publics
-   Système d'enchères

**Fonctionnalités :**

-   Échange de cartes et devises
-   Système d'expiration
-   Validation automatique

### 9. BoosterPack (Pack de Cartes)

Système de packs de cartes.

**Types de packs :**

-   Standard, Premium, Elite, Legendary
-   Différentes distributions de rareté
-   Cartes garanties
-   Effets spéciaux (foil, cartes bonus)

## Relations entre modèles

```
User (1) ←→ (N) UserCard (N) ←→ (1) Character
User (1) ←→ (N) Deck
User (1) ←→ (N) Game
Character (N) ←→ (1) Set
Set (1) ←→ (N) BoosterPack
User (1) ←→ (N) Trade
User (1) ←→ (N) Tournament
Game (N) ←→ (1) Tournament
```

## Fonctionnalités avancées

### Système de niveaux et évolution

-   Les cartes peuvent gagner de l'expérience et monter en niveau
-   Système d'évolution avec prérequis
-   Amélioration des statistiques

### Économie du jeu

-   Trois devises : pièces, gemmes, poussière
-   Système de prix dynamique
-   Récompenses multiples

### Système social

-   Amis et statuts
-   Classements et ligues
-   Paramètres de confidentialité

### Performance et optimisation

-   Index MongoDB optimisés
-   Middleware pour calculs automatiques
-   Validation de données intégrée

## Technologies utilisées

-   **Base de données** : MongoDB avec Mongoose ODM
-   **Validation** : Validation native Mongoose avec enums
-   **Performance** : Index composés et simples
-   **Flexibilité** : Schémas extensibles avec Mixed types

Ce modèle de données offre une base solide pour développer un TCG mobile complet avec toutes les fonctionnalités attendues d'un jeu moderne de cartes à collectionner.
