# 🚀 Guide de déploiement - Claude Prompt Manager

## 📋 Prérequis

- **Docker** : version 20.10+
- **Docker Compose** : version 2.0+
- **Ports disponibles** : 3005, 3105, 27017

---

## 🔧 Configuration initiale

### 1. Vérifier les fichiers .env

Les fichiers `.env` ont déjà été générés avec des secrets sécurisés :

```bash
# Vérifier les fichiers
cat .env
cat backend/.env
cat frontend/.env
```

✅ Les secrets JWT et ENCRYPTION ont été générés automatiquement.

---

## 🐳 Déploiement avec Docker Compose

### Étape 1 : Build les images Docker

```bash
cd /volume1/Docker_data/claude-manager-test
docker-compose build
```

**Durée estimée** : 5-10 minutes (selon la vitesse réseau)

### Étape 2 : Démarrer tous les services

```bash
docker-compose up -d
```

Cela va démarrer :
- 🗄️ **MongoDB** (port 27017)
- 🔧 **Backend API** (port 5000)
- 🎨 **Frontend React** (port 3000)

### Étape 3 : Vérifier que tout fonctionne

```bash
# Vérifier les containers en cours d'exécution
docker-compose ps

# Voir les logs
docker-compose logs -f
```

Vous devriez voir :
```
✅ claude_manager_mongodb    - running (healthy)
✅ claude_manager_backend    - running (healthy)
✅ claude_manager_frontend   - running (healthy)
```

---

## 🌐 Accès à l'application

### URLs de l'application

- **Frontend** : http://localhost:3005
- **Backend API** : http://localhost:3105/api
- **Health Check** : http://localhost:3105/health

### Tester l'API

```bash
# Health check
curl http://localhost:3105/health

# Devrait retourner:
# {"status":"ok","timestamp":"2025-11-02T..."}
```

---

## 👤 Premier test complet

### 1. Créer un compte utilisateur

1. Ouvrir http://localhost:3005
2. Cliquer sur "Register here"
3. Créer un compte :
   - Email : `test@example.com`
   - Password : `password123` (min 8 caractères)
4. Vous serez automatiquement connecté

### 2. Ajouter un compte Claude

1. Aller sur **Accounts** (dans la navbar)
2. Cliquer sur **Add Account**
3. Remplir :
   - **Name** : `Mon compte Claude`
   - **Type** : `Personal`
   - **API Key** : `sk-ant-...` (votre clé API Claude)
4. Cliquer sur **Create**

✅ Le compte est automatiquement défini comme actif

### 3. Créer un fragment réutilisable

1. Aller sur **Fragments**
2. Cliquer sur **New Fragment**
3. Créer un fragment :
   - **Name** : `professional_tone`
   - **Content** : `Use a professional and courteous tone in all communications.`
4. Cliquer sur **Create**

### 4. Créer votre premier prompt

1. Aller sur **Prompts**
2. Cliquer sur **New Prompt**
3. Créer un prompt :
   - **Title** : `Email de réponse professionnelle`
   - **Content** :
     ```
     {{fragment:professional_tone}}

     Write a professional email response about {{topic}} to {{recipient}}.

     Key points to address:
     - {{point1}}
     - {{point2}}
     ```
   - **Category** : `email`
   - **Tags** : `professional, communication`
4. Cliquer sur **Create**

✅ Le prompt est créé avec :
- Version 1
- Variables détectées : `topic`, `recipient`, `point1`, `point2`
- Fragment détecté : `professional_tone`

### 5. Tester les fonctionnalités

**Recherche et filtres** :
- Utiliser la barre de recherche
- Filtrer par catégorie : `email`
- Filtrer par tags

**Actions sur un prompt** :
- 📋 **Copier** : Copie le contenu dans le presse-papier
- ✏️ **Éditer** : Modifier le prompt (créé une nouvelle version)
- 🗑️ **Supprimer** : Supprime le prompt

**Gestion des comptes** :
- Créer plusieurs comptes Claude
- Basculer entre les comptes actifs
- Modifier ou supprimer un compte

---

## 🔍 Debugging et logs

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Logs backend (errors, API calls)

```bash
docker-compose logs -f backend | grep ERROR
docker-compose logs -f backend | grep POST
```

### Accéder au container

```bash
# Backend
docker exec -it claude_manager_backend sh

# MongoDB
docker exec -it claude_manager_mongodb mongosh
```

### Vérifier la base de données

```bash
# Se connecter à MongoDB
docker exec -it claude_manager_mongodb mongosh claude-manager

# Dans mongosh :
db.users.find()           # Lister les users
db.accounts.find()        # Lister les accounts
db.prompts.find()         # Lister les prompts
db.fragments.find()       # Lister les fragments
db.prompt_history.find()  # Lister l'historique
```

---

## 🛠️ Commandes utiles

### Redémarrer un service spécifique

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mongodb
```

### Rebuild après modification du code

```bash
# Rebuild tout
docker-compose down
docker-compose build
docker-compose up -d

# Rebuild un service spécifique
docker-compose build backend
docker-compose up -d backend
```

### Arrêter l'application

```bash
# Arrêter (conserve les données)
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v
```

### Nettoyer complètement

```bash
# Supprimer tout (containers, volumes, images)
docker-compose down -v
docker system prune -a
```

---

## 📊 Vérification de santé

### Health checks automatiques

Les health checks sont configurés dans `docker-compose.yml` :

- **MongoDB** : Vérifié toutes les 10s
- **Backend** : Vérifié toutes les 30s via `/health`
- **Frontend** : Vérifié toutes les 30s

Voir l'état :
```bash
docker-compose ps
```

### Test manuel des endpoints API

```bash
# Health check
curl http://localhost:3105/health

# Register (créer un user)
curl -X POST http://localhost:3105/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login (obtenir un token)
curl -X POST http://localhost:3105/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔐 Sécurité

### Secrets générés

Les secrets suivants ont été générés automatiquement :

- **JWT_SECRET** : Pour signer les tokens d'authentification
- **ENCRYPTION_SECRET** : Pour chiffrer les clés API Claude

⚠️ **Important** : Ces secrets sont stockés dans les fichiers `.env` qui ne sont **PAS** commités dans Git (listés dans `.gitignore`).

### Changer les secrets (production)

Pour un déploiement en production, générez de nouveaux secrets :

```bash
# Générer un nouveau secret
openssl rand -base64 32

# Mettre à jour dans .env, backend/.env
# Puis redémarrer :
docker-compose down
docker-compose up -d
```

---

## 📝 Backup de la base de données

### Backup MongoDB

```bash
# Créer un backup
docker exec claude_manager_mongodb mongodump \
  --db=claude-manager \
  --out=/data/backup

# Copier le backup localement
docker cp claude_manager_mongodb:/data/backup ./backup_$(date +%Y%m%d)
```

### Restaurer un backup

```bash
# Copier le backup dans le container
docker cp ./backup claude_manager_mongodb:/data/restore

# Restaurer
docker exec claude_manager_mongodb mongorestore \
  --db=claude-manager \
  /data/restore/claude-manager
```

---

## 🚨 Résolution de problèmes

### MongoDB ne démarre pas

```bash
# Vérifier les logs
docker-compose logs mongodb

# Supprimer le volume et recréer
docker-compose down -v
docker-compose up -d
```

### Backend : "Missing environment variable"

```bash
# Vérifier que .env existe
ls -la backend/.env

# Vérifier le contenu
cat backend/.env

# Rebuild et restart
docker-compose build backend
docker-compose up -d backend
```

### Frontend : API calls fail (CORS)

Vérifier que `FRONTEND_URL` dans `backend/.env` correspond à l'URL frontend :
```
FRONTEND_URL=http://localhost:3005
```

### Port déjà utilisé

```bash
# Trouver quel processus utilise le port
sudo lsof -i :3005
sudo lsof -i :3105

# Changer les ports dans docker-compose.yml si nécessaire
ports:
  - "3006:3005"  # Frontend
  - "3106:3105"  # Backend
```

---

## 🎯 Workflow de développement

### Développement local (sans Docker)

**Backend** :
```bash
cd backend
npm install
npm run dev  # Démarre sur port 5000
```

**Frontend** :
```bash
cd frontend
npm install
npm run dev  # Démarre sur port 5173
```

⚠️ Modifier `frontend/.env` :
```
VITE_API_URL=http://localhost:3105/api
```

---

## ✅ Checklist de déploiement

- [x] Fichiers `.env` créés avec secrets
- [x] Docker et Docker Compose installés
- [x] Ports 3005, 3105, 27017 disponibles
- [ ] `docker-compose build` exécuté avec succès
- [ ] `docker-compose up -d` démarré
- [ ] Les 3 services sont "healthy"
- [ ] http://localhost:3005 accessible
- [ ] http://localhost:3105/health retourne OK
- [ ] Compte créé et login fonctionnel
- [ ] Account Claude ajouté
- [ ] Prompt créé avec succès

---

## 🎓 Ressources

- **Documentation Docker** : https://docs.docker.com/
- **MongoDB Docs** : https://docs.mongodb.com/
- **React Docs** : https://react.dev/
- **Vite Docs** : https://vitejs.dev/

---

**Projet créé avec Claude Code** 🤖

**Stack** : React 18 + Vite + TypeScript + Tailwind CSS + Node.js + Express + MongoDB + Docker
