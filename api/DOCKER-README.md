# TCG Mobile API - Docker Setup Guide

Ce guide vous explique comment dockeriser et déployer l'API TCG Mobile avec PostgreSQL.

## 📋 Prérequis

- **Docker Desktop** installé sur votre machine
- **Docker Compose** (inclus avec Docker Desktop)
- **Git** pour cloner le projet
- Au moins **4GB de RAM** disponible pour les conteneurs

## 🏗️ Architecture Docker

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    Nginx     │  │   TCG API    │  │ PostgreSQL  │ │
│  │  (Reverse    │  │   (Node.js   │  │   Database  │ │
│  │   Proxy)     │  │   Express)   │  │             │ │
│  │   Port 80    │  │   Port 3000  │  │   Port 5432 │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│         │                  │                │        │
│         └──────────────────┼────────────────┘        │
│                            │                         │
│  ┌──────────────┐          │         ┌─────────────┐ │
│  │    Redis     │          │         │   Volumes   │ │
│  │  (Optional   │          │         │    Data     │ │
│  │   Caching)   │          │         │ Persistence │ │
│  │   Port 6379  │          │         │             │ │
│  └──────────────┘          │         └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 🚀 Démarrage Rapide

### Option 1: Utilisation des scripts automatiques

#### Sur Windows:
```powershell
# Setup développement
.\docker-setup.bat setup dev

# Setup production
.\docker-setup.bat setup prod
```

#### Sur Linux/Mac:
```bash
# Rendre le script exécutable
chmod +x docker-setup.sh

# Setup développement
./docker-setup.sh setup dev

# Setup production
./docker-setup.sh setup prod
```

### Option 2: Commandes manuelles

#### Développement:
```bash
# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Modifier les variables d'environnement si nécessaire
# notepad .env  # Windows
# nano .env     # Linux/Mac

# 3. Construire et démarrer les services
docker-compose -f docker-compose.dev.yml up -d

# 4. Attendre que la base de données soit prête (30 secondes)

# 5. Exécuter les migrations
docker-compose -f docker-compose.dev.yml exec api npx prisma migrate dev

# 6. (Optionnel) Seed la base de données
docker-compose -f docker-compose.dev.yml exec api npm run prisma:seed
```

#### Production:
```bash
# 1. Copier et configurer l'environnement
cp .env.example .env
# Modifier .env avec vos valeurs de production

# 2. Construire et démarrer
docker-compose up -d

# 3. Exécuter les migrations
docker-compose exec api npx prisma migrate deploy
```

## 📁 Structure des Fichiers Docker

```
api/
├── Dockerfile                 # Image de production
├── Dockerfile.dev            # Image de développement
├── docker-compose.yml        # Configuration production
├── docker-compose.dev.yml    # Configuration développement
├── .dockerignore             # Fichiers à ignorer
├── healthcheck.js            # Script de health check
├── docker-setup.sh           # Script de setup (Linux/Mac)
├── docker-setup.bat          # Script de setup (Windows)
└── docker/
    ├── nginx/
    │   └── nginx.conf        # Configuration Nginx
    └── postgres/
        └── init.sql          # Script d'initialisation DB
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` basé sur `.env.example`:

```bash
# Base de données
DATABASE_URL="postgresql://tcg_user:tcg_password_2024@postgres:5432/tcg_mobile?schema=public"

# JWT
JWT_SECRET="votre-clé-jwt-super-secrète"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="votre-clé-refresh-super-secrète"
JWT_REFRESH_EXPIRES_IN="30d"

# Serveur
PORT=3000
NODE_ENV="production"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Services Disponibles

#### Développement (`docker-compose.dev.yml`):
- **API**: `http://localhost:3000`
- **PostgreSQL**: `localhost:5433`
- **Volumes montés** pour le hot-reload

#### Production (`docker-compose.yml`):
- **API**: `http://localhost:3000`
- **Nginx**: `http://localhost:80`
- **PostgreSQL**: Interne au réseau Docker
- **Redis**: Cache optionnel
- **Volumes persistants**

## 📊 Gestion et Monitoring

### Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f                    # Production
docker-compose -f docker-compose.dev.yml logs -f  # Développement

# Statut des services
docker-compose ps

# Accéder au shell du conteneur API
docker-compose exec api sh

# Exécuter les migrations
docker-compose exec api npx prisma migrate dev

# Ouvrir Prisma Studio
docker-compose exec api npx prisma studio

# Backup de la base de données
docker-compose exec postgres pg_dump -U tcg_user tcg_mobile > backup.sql

# Restaurer une sauvegarde
docker-compose exec -T postgres psql -U tcg_user -d tcg_mobile < backup.sql
```

### Health Checks

L'API inclut des endpoints de santé:
- `GET /health` - Health check simple
- `GET /api/health` - Health check API avec métadonnées

### Monitoring des Conteneurs

```bash
# Ressources utilisées
docker stats

# Logs en temps réel
docker-compose logs -f api
docker-compose logs -f postgres

# Inspecter un conteneur
docker inspect tcg-api
```

## 🔒 Sécurité

### Production

1. **Variables d'environnement**: Changez toutes les clés secrètes
2. **Base de données**: Utilisez des mots de passe forts
3. **SSL**: Configurez HTTPS avec des certificats valides
4. **Firewall**: Limitez l'accès aux ports nécessaires
5. **Updates**: Maintenez les images Docker à jour

### Nginx Configuration

Le fichier `docker/nginx/nginx.conf` inclut:
- Rate limiting
- Headers de sécurité
- Proxy vers l'API
- Configuration SSL (commentée)

## 🔄 Déploiement

### Développement Local

```bash
# Démarrer
./docker-setup.sh setup dev

# Arrêter
./docker-setup.sh stop dev

# Redémarrer
./docker-setup.sh restart dev
```

### Production

```bash
# Déploiement initial
./docker-setup.sh setup prod

# Mise à jour du code
git pull
docker-compose build api
docker-compose up -d api

# Migrations après mise à jour
docker-compose exec api npx prisma migrate deploy
```

### CI/CD Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        run: |
          ssh user@server 'cd /path/to/app && git pull'
          ssh user@server 'cd /path/to/app && docker-compose build'
          ssh user@server 'cd /path/to/app && docker-compose up -d'
```

## 🐛 Troubleshooting

### Problèmes Courants

1. **Port déjà utilisé**:
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :3000
   
   # Changer le port dans docker-compose.yml
   ports:
     - "3001:3000"  # Utiliser le port 3001
   ```

2. **Base de données non accessible**:
   ```bash
   # Vérifier le statut
   docker-compose ps
   
   # Vérifier les logs
   docker-compose logs postgres
   
   # Redémarrer la base
   docker-compose restart postgres
   ```

3. **Migrations échouées**:
   ```bash
   # Reset de la base (ATTENTION: supprime les données)
   docker-compose exec api npx prisma migrate reset
   
   # Forcer les migrations
   docker-compose exec api npx prisma db push
   ```

4. **Problèmes de permissions**:
   ```bash
   # Linux/Mac: Corriger les permissions
   sudo chown -R $USER:$USER ./uploads
   chmod -R 755 ./uploads
   ```

### Logs et Debug

```bash
# Tous les logs
docker-compose logs

# Logs d'un service spécifique
docker-compose logs api
docker-compose logs postgres

# Logs avec timestamps
docker-compose logs -t api

# Suivre les logs en temps réel
docker-compose logs -f api
```

## 📈 Performance

### Optimisations

1. **Multi-stage build**: Le Dockerfile utilise une image alpine légère
2. **Cache Docker**: Les layers sont optimisés pour le cache
3. **Health checks**: Monitoring automatique des services
4. **Resource limits**: Configurez les limites de ressources si nécessaire

### Monitoring Production

```bash
# Ressources système
docker stats --no-stream

# Espace disque des volumes
docker system df

# Nettoyage (attention en production)
docker system prune -f
```

## 🆘 Support

En cas de problème:

1. Vérifiez les logs: `docker-compose logs`
2. Vérifiez le statut: `docker-compose ps`
3. Testez la connectivité: `curl http://localhost:3000/health`
4. Consultez la documentation Prisma pour les problèmes de DB

---

🎮 **Votre API TCG est maintenant dockerisée et prête pour le déploiement !**
