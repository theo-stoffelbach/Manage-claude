# Terminal Claude Code Web

Application web full-stack permettant d'accéder à un terminal web en temps réel avec intégration Claude Code.

## 🚀 Fonctionnalités

- ✅ **Terminal web temps réel** : Vrai terminal bash via node-pty + xterm.js
- ✅ **Authentification WebSocket** : Inscription/connexion sans routes HTTP
- ✅ **Gestion des sessions** : Création, liste, chargement de sessions terminal
- ✅ **Intégration Claude Code** : Lancement de Claude dans des projets
- ✅ **Historique des commandes** : Sauvegarde en base PostgreSQL
- ✅ **Interface moderne** : React + Tailwind CSS + shadcn/ui

## 🏗️ Architecture

### Backend
- **Node.js + Express + Socket.IO** : Serveur WebSocket
- **node-pty** : Pseudo-terminaux Linux natifs
- **PostgreSQL** : Base de données (users, sessions, historique)
- **express-session + connect-pg-simple** : Sessions persistantes
- **bcryptjs** : Hachage des mots de passe

### Frontend
- **React 18** : Framework UI
- **@xterm/xterm** : Émulateur terminal (utilisé par VS Code)
- **Socket.IO client** : Communication temps réel
- **React Router** : Navigation
- **Tailwind CSS + shadcn/ui** : Interface moderne

### Infrastructure
- **Docker Compose** : 3 services (postgres, backend, frontend)
- **PostgreSQL 15** : Base de données relationnelle
- **Port 3000** : Frontend React
- **Port 3001** : Backend WebSocket

## 📦 Installation & Lancement

### Prérequis
- Docker & Docker Compose
- Node.js 18+ (pour développement local)

### Démarrage rapide

```bash
# Cloner le repo
git clone <votre-repo>
cd claude-manager-test

# Lancer tous les services
docker compose up -d

# Vérifier les logs
docker compose logs -f

# Accéder à l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Variables d'environnement

Fichier `.env` à la racine :
```env
SESSION_SECRET=your_random_secret_here
NODE_ENV=development
```

## 🧪 Tests

Pages de test disponibles :
- **http://localhost:3001/test** : Terminal web basique
- **http://localhost:3001/test-auth** : Test authentification
- **http://localhost:3001/health** : Health check

## 📖 Utilisation

### 1. Inscription/Connexion
1. Ouvrir http://localhost:3000
2. Créer un compte (username, email, password)
3. Se connecter

### 2. Terminal web
- Le terminal est créé automatiquement à la connexion
- Taper des commandes comme dans un terminal normal
- Support complet des couleurs ANSI et caractères spéciaux

### 3. Gestion des sessions
- Créer des sessions terminal multiples
- Sauvegarder l'historique des commandes
- Reprendre une session précédente

### 4. Claude Code (optionnel)
```bash
# Installer Claude CLI dans le container backend
docker exec -it terminal_backend sh
npm install -g @anthropic-ai/claude-code
claude auth

# Puis utiliser depuis l'interface frontend
```

## 📁 Structure du projet

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration PostgreSQL
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # User, Session, History
│   │   ├── services/        # PTY, Claude services
│   │   ├── socket/          # Socket.IO handlers
│   │   └── server.js        # Point d'entrée
│   ├── db/
│   │   └── schema.sql       # Schéma PostgreSQL
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Pages React
│   │   ├── services/        # Socket.IO client
│   │   └── App.js           # Point d'entrée
│   └── Dockerfile
└── docker-compose.yml
```

## 🔒 Sécurité

- Sessions sécurisées avec cookies httpOnly
- Mots de passe hachés avec bcrypt (10 rounds)
- Validation des chemins de projet (pas de .., chemins absolus)
- Isolation des terminaux par utilisateur
- Authentification requise pour toutes les actions

## 🐳 Commandes Docker

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Rebuild complet
docker compose down
docker compose build --no-cache
docker compose up -d

# Logs en temps réel
docker compose logs -f backend
docker compose logs -f frontend

# Accès shell backend
docker exec -it terminal_backend sh

# Accès PostgreSQL
docker exec -it terminal_postgres psql -U terminal_user -d terminal_app
```

## 📊 Base de données

### Tables
- **users** : Comptes utilisateurs
- **terminal_sessions** : Sessions terminal
- **command_history** : Historique des commandes
- **claude_interactions** : Actions de Claude Code
- **session** : Sessions express-session

## 🔧 Développement

### Backend
```bash
cd backend
npm install
npm run dev  # Mode développement avec nodemon
```

### Frontend
```bash
cd frontend
npm install
npm start  # Mode développement React
```

## 🎯 Événements Socket.IO

### Authentification
- `auth:register` / `auth:register:success`
- `auth:login` / `auth:login:success`
- `auth:logout` / `auth:logout:success`
- `auth:check` / `auth:check:result`

### Sessions
- `session:create` / `session:created`
- `session:list` / `session:list:result`
- `session:load` / `session:loaded`
- `session:rename` / `session:renamed`

### Terminal
- `terminal:input` → Envoyer des caractères
- `terminal:output` ← Recevoir l'output
- `terminal:resize` → Redimensionner
- `terminal:exit` ← Terminal fermé

### Claude Code
- `claude:launch` / `claude:launched`
- `claude:check` / `claude:check:result`

## 📝 TODO / Améliorations futures

- [ ] Support multi-sessions simultanées
- [ ] Collaboration temps réel (2+ utilisateurs)
- [ ] Upload/download de fichiers
- [ ] Gestion avancée des sessions Claude
- [ ] Raccourcis clavier personnalisables
- [ ] Mode sombre/clair
- [ ] Export de l'historique
- [ ] Notifications temps réel

## 🤝 Contribution

Projet créé pour démonstration et apprentissage.

## 📄 Licence

MIT

---

**Développé avec** : Node.js, React, PostgreSQL, Docker, xterm.js, Socket.IO, Tailwind CSS
