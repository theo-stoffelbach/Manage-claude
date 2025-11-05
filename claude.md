# Terminal Claude Code Web - Guide pour Claude/Cursor

## Vue d'ensemble du projet

Tu dois créer une application web complète qui permet de :
1. Se connecter et s'authentifier via WebSocket
2. Accéder à un terminal web en temps réel (style VS Code terminal)
3. Naviguer dans les dossiers du système et exécuter des commandes
4. Lancer Claude Code automatiquement et voir ses modifications en live
5. Sauvegarder l'historique des sessions terminal et des commandes

**Architecture :** Node.js + React + PostgreSQL + Socket.IO + xterm.js + shadcn/ui

---

## 🎯 Points essentiels

### WebSocket ONLY
- **Pas de routes HTTP** (sauf pour servir le bundle React en statique)
- Toute la communication se fait via Socket.IO
- Authentification via sessions express-session + cookies
- Les événements Socket.IO remplacent complètement les API REST

### Technologies clés
- **Backend** : Express.js + Socket.IO + node-pty + PostgreSQL
- **Frontend** : React.js + xterm.js + Socket.IO client + shadcn/ui
- **Terminal** : node-pty crée de vrais pseudo-terminaux Linux
- **UI** : shadcn/ui pour tous les composants (buttons, dialogs, dropdowns, etc.)
- **Émulation terminal** : xterm.js (utilisé par VS Code, Hyper, etc.)

### Docker
- 3 services : backend, frontend, postgres
- Tous dans un même docker-compose.yml
- Réseau interne pour communication inter-conteneurs
- PostgreSQL sur hostname `postgres` (pas `localhost`)
- Déploiement : c'est l'utilisateur qui le gère

---

## 📋 Architecture technique détaillée

### Backend - Communication WebSocket

**Flux d'authentification :**
1. Frontend se connecte à Socket.IO (sans être authentifié)
2. Frontend émet `auth:login` avec username/password
3. Backend vérifie les credentials
4. Si OK, crée une session express-session (stockée en PostgreSQL)
5. Le client reçoit un cookie httpOnly
6. Ce cookie persiste les reconnexions

**Flux terminal :**
1. Frontend émet `session:create` (créer nouvelle session terminal)
2. Backend crée un pseudo-terminal avec `node-pty` (processus real bash)
3. Backend émet `terminal:output` quand le pseudo-terminal produit du texte
4. Frontend reçoit et affiche dans xterm.js
5. Frontend émet `terminal:input` quand l'utilisateur tape
6. Backend reçoit et l'écrit dans le pseudo-terminal
7. Tout s'affiche en temps réel (latence minimale)

**Événements Socket.IO principaux :**
- `auth:login` → Backend valide → `auth:login:success` ou `auth:login:error`
- `auth:register` → Backend crée user → `auth:register:success` ou erreur
- `session:create` → Backend crée session terminal → `session:created`
- `session:load` → Backend envoie historique → `session:history`
- `session:list` → Backend envoie toutes les sessions
- `terminal:input` → Frontend envoie caractères tapés
- `terminal:output` ← Backend envoie output du terminal
- `terminal:resize` → Frontend envoie nouvelles dimensions
- `claude:launch` → Frontend demande lancer Claude → `claude:launched`

### Backend - Base de données

**Tables PostgreSQL :**
- `users` : id, username, email, password_hash, created_at
- `terminal_sessions` : id, user_id, title, project_path, created_at, updated_at
- `command_history` : id, session_id, command, output, executed_at
- `claude_interactions` : id, session_id, prompt, files_modified (JSONB), created_at
- `session` : Table générée auto par express-session (stockage des sessions)

### Backend - Pseudo-terminal avec node-pty

**Ce qu'il doit faire :**
- `node-pty` crée un vrai pseudo-terminal (PTY = pseudo-tty)
- C'est pas une émulation, c'est un vrai shell bash qui tourne
- Le backend peut écrire des commandes dedans
- Le backend capte tout ce que le shell produit

**Automatisation Claude :**
1. Backend écrit `cd /chemin/projet\r` dans le PTY
2. Le shell exécute la commande et change de répertoire
3. Backend attend 500ms
4. Backend écrit `claude\r` pour lancer Claude Code
5. Claude démarre et on voit tout s'afficher en temps réel au frontend

### Frontend - Interface React

**Layout :**
- Sidebar à gauche (300px) : liste des sessions terminal
- Zone principale à droite (flex-grow) : le terminal web + header
- Tous les composants utilisent shadcn/ui (button, dialog, dropdown, etc.)

**Composants principaux :**
- `LoginForm` / `RegisterForm` : Formulaires shadcn/ui
- `Sidebar` : Liste des sessions avec actions (renommer, supprimer)
- `Terminal` : xterm.js intégré dans React
- `ProjectSelectorDialog` : Dialog shadcn/ui pour choisir le projet Claude
- `MainApp` : Layout principal

**État global :**
- `AuthContext` : Stocke user, isAuthenticated, fonctions login/logout
- `SessionContext` : Stocke sessions[], currentSessionId, fonctions pour créer/charger sessions

### Frontend - Terminal web avec xterm.js

**Initialisation :**
1. Créer instance `new Terminal({options})`
2. Charger addon `FitAddon` pour adapter la taille
3. Ouvrir dans un DOM element
4. Appeler `fitAddon.fit()` pour calculer cols/rows

**Communication bidirectionnelle :**
- Écouter `terminal:output` depuis le backend → `terminal.write(data)` pour afficher
- Écouter `terminal.onData()` pour les inputs utilisateur → émettre `terminal:input`
- Écouter `window.resize` → `fitAddon.fit()` → émettre `terminal:resize`

---

## 🔧 Workflow détaillé

### 1. Démarrage de l'app
```
User ouvre http://localhost:3000
↓
Frontend : Page de login
Backend : Attend les connexions
```

### 2. Connexion utilisateur
```
User tape username/password dans le formulaire
↓
Frontend émet : socket.emit('auth:login', {username, password})
↓
Backend reçoit, cherche user dans PostgreSQL
Backend hashe le password et compare
↓
Si OK : req.session.userId = user.id (stocké dans PostgreSQL)
Si KO : socket.emit('auth:login:error', 'Invalid credentials')
↓
Frontend reçoit 'auth:login:success', crée page principale
```

### 3. Créer une nouvelle session terminal
```
User clique sur "Nouvelle session" dans la sidebar
↓
Frontend émet : socket.emit('session:create', {title: 'Session du 05/11'})
↓
Backend crée entry dans table terminal_sessions
Backend crée un pseudo-terminal avec node-pty
Backend stocke dans Map : sessionId → ptyProcess
Backend émet : socket.emit('session:created', {sessionId})
↓
Frontend charge la session et affiche le terminal vide
```

### 4. User tape une commande
```
User tape "ls" dans xterm.js et appuie sur Enter
↓
xterm.js émet : socket.emit('terminal:input', 'ls\r')
↓
Backend reçoit 'ls\r'
Backend écrit dans le pseudo-terminal : ptyProcess.write('ls\r')
↓
Le shell bash exécute 'ls' et produit du texte
Backend détecte cet output via ptyProcess.onData()
Backend enregistre la commande dans command_history
Backend émet : socket.emit('terminal:output', 'fichier1\nfichier2\n...')
↓
Frontend reçoit et écrit dans xterm.js
xterm.js affiche "fichier1\nfichier2\n..." à l'écran
```

### 5. User clique "Lancer Claude Code"
```
User clique sur bouton "Lancer Claude Code"
↓
Frontend ouvre un Dialog shadcn/ui avec input pour le chemin du projet
User tape "/home/user/mon-projet"
User clique "Lancer Claude"
↓
Frontend émet : socket.emit('claude:launch', {projectPath: '/home/user/mon-projet'})
↓
Backend reçoit la demande
Backend lance claudeService.launchClaude(ptyProcess, projectPath)
↓
claudeService écrit :
  ptyProcess.write('cd /home/user/mon-projet\r')
  [attend 500ms]
  ptyProcess.write('claude\r')
↓
Claude Code démarre dans le pseudo-terminal
Tout l'output de Claude est capté et envoyé au frontend en temps réel
↓
Frontend voit Claude faire ses actions en direct dans le terminal
User peut aussi taper des commandes normalement (si Claude demande quelque chose)
```

### 6. Charger une session précédente
```
User clique sur une ancienne session dans la sidebar
↓
Frontend émet : socket.emit('session:load', {sessionId: 123})
↓
Backend récupère l'historique : SELECT * FROM command_history WHERE session_id = 123
Backend émet : socket.emit('session:history', {commands: [...]})
↓
Frontend affiche l'historique dans le terminal (ou dans une zone séparée)
```

---

## 📦 Structure des dossiers

```
terminal-claude-app/
├── docker-compose.yml          # 3 services : backend, frontend, postgres
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── src/
│   │   ├── server.js           # Point d'entrée, Express + Socket.IO
│   │   ├── config/
│   │   │   └── database.js     # Pool PostgreSQL, init schema
│   │   ├── socket/
│   │   │   ├── auth.js         # Événements d'authentification
│   │   │   ├── terminal.js     # Événements terminal
│   │   │   └── claude.js       # Événements Claude
│   │   ├── services/
│   │   │   ├── ptyService.js   # Création/gestion pseudo-terminaux
│   │   │   ├── claudeService.js # Automatisation Claude Code
│   │   │   └── commandParser.js # Parsing des commandes
│   │   ├── models/
│   │   │   ├── User.js         # Requêtes SQL pour users
│   │   │   ├── TerminalSession.js
│   │   │   └── CommandHistory.js
│   │   └── middleware/
│   │       └── socketAuth.js   # Vérification auth WebSocket
│   └── db/
│       └── schema.sql          # Schéma PostgreSQL
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.jsx             # Routes React Router
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── MainApp.jsx     # Sidebar + Terminal
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SessionItem.jsx
│   │   │   ├── Terminal.jsx
│   │   │   ├── ProjectSelectorDialog.jsx
│   │   │   └── (autres composants shadcn/ui)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SessionContext.jsx
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── socket.js       # Client Socket.IO
│   │   └── utils/
│   └── tailwind.config.js      # Config shadcn/ui
```

---

## 🔐 Sécurité

### Authentification WebSocket
- **Session cookies** : httpOnly, secure (HTTPS en prod), sameSite
- **Middleware Socket.IO** : Vérifie `socket.request.session.userId` avant chaque événement
- **Isolation par user** : Chaque utilisateur ne voit que ses propres sessions

### Pseudo-terminal
- **Isolation** : Chaque utilisateur a son propre processus shell
- **Un utilisateur ne peut pas accéder au PTY d'un autre utilisateur**
- **Commandes dangereuses** : Potentiellement bloquer certaines (ex: `rm -rf /`)

---

## 📝 Événements Socket.IO complets

### Authentification
```
CLIENT → SERVER : auth:register | {username, email, password}
SERVER → CLIENT : auth:register:success | ou auth:register:error

CLIENT → SERVER : auth:login | {username, password}
SERVER → CLIENT : auth:login:success | {userId, username} ou auth:login:error
```

### Sessions Terminal
```
CLIENT → SERVER : session:create | {title?}
SERVER → CLIENT : session:created | {sessionId}

CLIENT → SERVER : session:list |
SERVER → CLIENT : sessions:list:result | {sessions: [...]}

CLIENT → SERVER : session:load | {sessionId}
SERVER → CLIENT : session:history | {commands: [...], outputs: [...]}

CLIENT → SERVER : session:rename | {sessionId, newTitle}
SERVER → CLIENT : session:renamed | {sessionId, newTitle}
```

### Terminal
```
CLIENT → SERVER : terminal:input | "ls\r"
SERVER → CLIENT : terminal:output | "fichier1\nfichier2\n"

CLIENT → SERVER : terminal:resize | {cols: 80, rows: 30}
SERVER → CLIENT : - (pas de réponse, juste resize)
```

### Claude Code
```
CLIENT → SERVER : claude:launch | {projectPath}
SERVER → CLIENT : claude:launched | ou claude:error | {message}

SERVER → CLIENT : claude:interaction | {files_modified: [...]}
```

---

## 🚀 Lancement avec Docker

```bash
# À la racine du projet
docker-compose up

# Backend sur http://localhost:3001 (WebSocket)
# Frontend sur http://localhost:3000
# PostgreSQL sur postgres:5432 (interne)

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Arrêter
docker-compose down

# Arrêter + supprimer les volumes (données)
docker-compose down -v
```

---

## 🧪 Testing Flow

### 1. Test authentification
```
1. Ouvrir http://localhost:3000
2. Voir page de login
3. Cliquer sur "Créer un compte"
4. Remplir le formulaire (username, email, password)
5. Cliquer "S'inscrire"
6. Devrait afficher succès ou erreur
7. Aller à la page de login
8. Remplir avec les credentials
9. Cliquer "Se connecter"
10. Devrait rediriger à /app
```

### 2. Test terminal basique
```
1. Être connecté, voir la sidebar + terminal vide
2. Terminal devrait être vide
3. Taper "ls" dans le terminal
4. Appuyer sur Enter
5. Voir la liste des fichiers s'afficher
6. Taper "pwd"
7. Voir le répertoire courant
8. Taper "cd /tmp"
9. Taper "ls"
10. Voir les fichiers du répertoire /tmp
```

### 3. Test créer session
```
1. Cliquer sur "Nouvelle session"
2. Terminal doit s'effacer
3. Un nouvel item devrait apparaître dans la sidebar
4. Taper une commande dans le nouveau terminal
5. Ça doit fonctionner normalement
6. Cliquer sur une ancienne session dans la sidebar
7. Doit charger l'historique précédent
```

### 4. Test Claude Code
```
1. Avoir un projet local (ex: /tmp/my-project)
2. Cliquer sur "Lancer Claude"
3. Saisir le chemin : /tmp/my-project
4. Cliquer "Lancer Claude"
5. Voir "cd /tmp/my-project" s'exécuter
6. Voir "claude" s'exécuter
7. Voir l'interface Claude Code en direct dans le terminal
8. (Si Claude est authentifié et fonctionne)
```

---

## ⚠️ Points d'attention importants

### PostgreSQL dans Docker
- Host: `postgres` (pas localhost)
- Port: `5432`
- User: À définir dans docker-compose.yml
- Database: `terminal_app`
- **Important** : La table `session` (pour express-session) doit exister avant que l'app démarre

### Express-session + PostgreSQL
- Les sessions sont stockées EN BASE DE DONNÉES (pas en mémoire)
- Cela permet que les sessions survivent aux redémarrages
- Il faut une table `session` (créée auto par le middleware)

### node-pty sur Debian/Linux
- Dépendances : `build-essential`, `python3`, `git`
- Dockerfile doit installer ces dépendances
- Potentiellement besoin d'utiliser `apk` pour Alpine ou `apt-get` pour Debian

### xterm.js
- Supporte les codes ANSI (couleurs, styles)
- Supporte Unicode
- Important : charger le CSS (import 'xterm/css/xterm.css')

### Claude Code dans le PTY
- Claude Code CLI doit être installé : `npm install -g @anthropic-ai/claude-code`
- Claude Code doit être authentifié : `claude auth`
- Dans un PTY automatisé, Claude peut demander des confirmations (Y/N)
- Ça doit marcher normalement (le PTY gère l'interactivité)

---

## 🔄 Flux de développement recommandé

### Phase 1 : Backend de base
1. ✅ Serveur Express + Socket.IO (juste la structure)
2. ✅ Événements Socket.IO basiques (connection/disconnect)
3. ✅ node-pty intégration (créer un terminal, écrire/lire)
4. ✅ Test avec client Socket.IO simple

### Phase 2 : Authentification
1. ✅ PostgreSQL + schema
2. ✅ Événements `auth:login`, `auth:register`
3. ✅ Express-session
4. ✅ Middleware d'authentification Socket.IO

### Phase 3 : Sessions terminal + historique
1. ✅ Événements `session:create`, `session:list`, `session:load`
2. ✅ Enregistrement de l'historique en base
3. ✅ Récupération de l'historique

### Phase 4 : Claude Code
1. ✅ Test Claude Code dans un PTY manuel
2. ✅ Service `claudeService.launchClaude()`
3. ✅ Événement `claude:launch`

### Phase 5 : Frontend
1. ✅ Login/Register avec shadcn/ui
2. ✅ xterm.js intégration
3. ✅ Sidebar + liste sessions
4. ✅ Interface "Lancer Claude"

### Phase 6 : Polish
1. ✅ Toasts shadcn/ui
2. ✅ Gestion erreurs
3. ✅ Responsive design
4. ✅ Raccourcis clavier

---

## 📌 Variables d'environnement

### Backend `.env`
```
PORT=3001
DATABASE_URL=postgresql://user:password@postgres:5432/terminal_app
SESSION_SECRET=un_secret_très_long_et_aléatoire
NODE_ENV=development
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://terminal_user:terminal_password@postgres:5432/terminal_app
      - SESSION_SECRET=dev_secret_key
      - NODE_ENV=development
    depends_on:
      - postgres
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=terminal_user
      - POSTGRES_PASSWORD=terminal_password
      - POSTGRES_DB=terminal_app
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge
```

---

## ✅ Checklist finale

- [ ] Backend se lance sans erreur
- [ ] Frontend se lance sans erreur
- [ ] PostgreSQL se connecte
- [ ] Socket.IO connection fonctionne
- [ ] Login/Register fonctionnent
- [ ] Terminal affiche les commandes exécutées
- [ ] Les commandes s'exécutent en temps réel
- [ ] Les sessions sont sauvegardées en base
- [ ] Claude Code se lance automatiquement
- [ ] L'historique se récupère correctement
- [ ] Responsive design sur mobile
- [ ] Pas de console errors critiques

---

## 🎓 Ressources utiles

- **xterm.js** : https://xtermjs.org/
- **node-pty** : https://github.com/microsoft/node-pty
- **Socket.IO** : https://socket.io/docs/
- **shadcn/ui** : https://ui.shadcn.com/
- **React** : https://react.dev/
- **PostgreSQL** : https://www.postgresql.org/docs/

---

Maintenant tu as tout ce qu'il faut pour expliquer à Claude ou Cursor ce que tu veux faire ! 🚀
