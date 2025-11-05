Phase 0 : Configuration du projet
Tâche 0.1 : Initialiser le projet
 Créer la structure de dossiers racine : terminal-claude-app/

 Créer le dossier backend/ pour le serveur Node.js

 Créer le dossier frontend/ pour l'application React

 Créer un fichier .gitignore global pour ignorer node_modules/, .env, etc.

 Initialiser un dépôt Git : git init

Tâche 0.2 : Configurer le backend
 Dans backend/, exécuter npm init -y

 Installer les dépendances principales :

express : Framework serveur HTTP (juste pour servir les assets statiques)

socket.io : Communication temps réel uniquement

node-pty : Pseudo-terminal

pg : Client PostgreSQL

express-session : Gestion sessions (stockée en PostgreSQL)

connect-pg-simple : Store sessions PostgreSQL

bcryptjs : Hachage passwords

dotenv : Variables d'environnement

 Installer les dépendances de développement :

nodemon : Redémarrage auto du serveur

 Créer le fichier .env avec les variables :

PORT=3001

DATABASE_URL=postgresql://user:password@postgres:5432/terminal_app

SESSION_SECRET=ton_secret_très_long_et_aléatoire

NODE_ENV=development

 Créer .env.example avec la même structure mais sans valeurs sensibles

Tâche 0.3 : Configurer le frontend
 Dans le dossier racine, exécuter npx create-react-app frontend

 Dans frontend/, installer les dépendances :

socket.io-client : Client Socket.IO uniquement

xterm : Émulateur terminal

@xterm/addon-fit : Addon pour adapter la taille

react-router-dom : Navigation

 Installer shadcn/ui et ses dépendances :

npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p

npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot clsx class-variance-authority

npm install lucide-react

Copier les composants de base shadcn/ui (button, input, card, dialog, etc.)

 Configurer Tailwind dans tailwind.config.js

 Ajouter les directives Tailwind dans src/index.css

Tâche 0.4 : Configurer la base de données
 Créer un fichier backend/db/schema.sql avec le schéma complet

 Créer un script backend/db/init.js pour initialiser la base (appelé au startup du backend)

 Ce script doit :

Vérifier si les tables existent

Les créer si nécessaire

Créer la table session pour express-session

Tâche 0.5 : Structure des dossiers backend
 Créer backend/src/server.js : Point d'entrée principal

 Créer backend/src/config/database.js : Configuration PostgreSQL

 Créer backend/src/socket/ : Dossier pour les événements Socket.IO

 Créer backend/src/controllers/ : Logique métier

 Créer backend/src/services/ : Services (pty, claude, etc.)

 Créer backend/src/models/ : Modèles de données

 Créer backend/src/middleware/ : Middlewares (auth, etc.)

Tâche 0.6 : Structure des dossiers frontend
 Créer frontend/src/components/ : Composants React et shadcn/ui

 Créer frontend/src/pages/ : Pages principales

 Créer frontend/src/hooks/ : Custom hooks

 Créer frontend/src/services/ : Services (Socket)

 Créer frontend/src/context/ : Contexts React

 Créer frontend/src/utils/ : Utilitaires

Tâche 0.7 : Configurer Docker Compose
 Créer un fichier docker-compose.yml à la racine du projet

 Définir 3 services :

backend : Build depuis ./backend, expose port 3001

frontend : Build depuis ./frontend, expose port 3000

postgres : Image officielle PostgreSQL 15, volume pour les données

 Configurer un réseau interne app-network

 Configurer les variables d'environnement pour chaque service

 Ajouter un volume pour PostgreSQL : pgdata

 Créer un Dockerfile pour le backend :

Base image : node:18-alpine

Copy package.json et package-lock.json

Install dependencies

Copy src code

Expose port 3001

Command: npm start

 Créer un Dockerfile pour le frontend :

Base image : node:18-alpine

Copy package.json et package-lock.json

Install dependencies

Copy src code

Expose port 3000

Command: npm start

 Ajouter .dockerignore pour ne pas copier node_modules et .git

Tâche 0.8 : Configuration .env pour Docker
 Dans le backend .env (pour Docker) :

DATABASE_URL=postgresql://terminal_user:terminal_password@postgres:5432/terminal_app

Note : Dans Docker, le host PostgreSQL s'appelle postgres (nom du service)

 Dans le frontend, pas d'env nécessaire (Socket.IO va se connecter à localhost:3001 depuis le navigateur)

Phase 1 : Backend - Serveur WebSocket basique et pseudo-terminal
Tâche 1.1 : Créer le serveur Express minimal avec Socket.IO
 Dans server.js, importer Express et Socket.IO

 Créer l'app Express

 Configurer le middleware express.json() (pour les futures requêtes)

 Créer un serveur HTTP avec Express

 Intégrer Socket.IO directement sur ce serveur HTTP

 Configurer Socket.IO avec CORS pour le frontend (port 3000)

 Note : Pas de routes HTTP, tout via WebSocket

 Faire écouter le serveur sur le port défini dans .env

 Tester avec nodemon src/server.js

Tâche 1.2 : Créer les événements Socket.IO basiques
 Ajouter un listener io.on('connection') qui log "Client connecté"

 Ajouter un listener socket.on('disconnect') qui log "Client déconnecté"

 Tester la connexion avec un client Socket.IO simple

Tâche 1.3 : Créer le service de pseudo-terminal
 Créer services/ptyService.js

 Importer node-pty

 Créer une fonction createTerminal(userId, initialDir) qui :

Spawn un processus shell (bash pour Debian/UgreeOS)

Configure les dimensions par défaut (80 colonnes, 30 lignes)

Définit le répertoire de départ

Retourne l'instance du pseudo-terminal

 Créer une Map activeTerminals pour stocker les terminaux par userId

Tâche 1.4 : Connecter le pseudo-terminal avec Socket.IO
 Dans l'événement connection de Socket.IO :

Créer un nouveau pseudo-terminal

Stocker l'instance dans la Map

 Écouter les données du pseudo-terminal avec ptyProcess.onData()

 Envoyer ces données au frontend via socket.emit('terminal:output', data)

 Écouter l'événement terminal:input du frontend

 Écrire l'input dans le pseudo-terminal avec ptyProcess.write(data)

 Gérer l'événement disconnect pour tuer le processus et le retirer de la Map

Tâche 1.5 : Gérer le redimensionnement du terminal
 Écouter l'événement terminal:resize du frontend

 Extraire cols et rows de l'événement

 Appeler ptyProcess.resize(cols, rows)

Tâche 1.6 : Tester le terminal basique
 Créer un client Socket.IO minimal en HTML

 Se connecter au serveur

 Envoyer des commandes simples : ls, pwd, echo "test"

 Vérifier que les outputs sont bien reçus

 Tester la navigation : cd /tmp puis pwd

 Tester une commande interactive : read, puis entrer une valeur

Phase 2 : Backend - Authentification et base de données (WebSocket only)
Tâche 2.1 : Créer le schéma PostgreSQL
 Dans db/schema.sql, créer la table users :

id : SERIAL PRIMARY KEY

username : VARCHAR(255) UNIQUE NOT NULL

email : VARCHAR(255) UNIQUE NOT NULL

password_hash : VARCHAR(255) NOT NULL

created_at : TIMESTAMP DEFAULT NOW()

 Créer la table terminal_sessions :

id : SERIAL PRIMARY KEY

user_id : INTEGER REFERENCES users(id)

title : VARCHAR(255)

project_path : TEXT

created_at : TIMESTAMP DEFAULT NOW()

updated_at : TIMESTAMP DEFAULT NOW()

 Créer la table command_history :

id : SERIAL PRIMARY KEY

session_id : INTEGER REFERENCES terminal_sessions(id)

command : TEXT NOT NULL

output : TEXT

executed_at : TIMESTAMP DEFAULT NOW()

 Créer la table claude_interactions :

id : SERIAL PRIMARY KEY

session_id : INTEGER REFERENCES terminal_sessions(id)

prompt : TEXT

files_modified : JSONB

created_at : TIMESTAMP DEFAULT NOW()

Tâche 2.2 : Configurer la connexion PostgreSQL
 Dans config/database.js, créer un pool de connexions PostgreSQL

 Importer pg et créer une instance Pool avec DATABASE_URL

 Exporter le pool pour utilisation dans les modèles

 Créer une fonction initializeDatabase() qui :

Lit le fichier schema.sql

Exécute les queries pour créer les tables (seulement si elles n'existent pas)

Appeler cette fonction au startup du serveur

Tâche 2.3 : Créer les modèles de données
 Créer models/User.js avec les méthodes :

create(username, email, passwordHash) : Créer un utilisateur

findByUsername(username) : Trouver par username

findById(id) : Trouver par ID

 Créer models/TerminalSession.js avec :

create(userId, title, projectPath) : Créer une session

findByUserId(userId) : Récupérer toutes les sessions d'un user

findById(id) : Trouver une session par ID

updateTitle(id, title) : Mettre à jour le titre

 Créer models/CommandHistory.js avec :

create(sessionId, command, output) : Enregistrer une commande

findBySessionId(sessionId) : Récupérer l'historique d'une session

Tâche 2.4 : Créer un événement Socket.IO pour l'inscription
 Créer un événement auth:register que le frontend émet

 Extraire username, email, password du payload

 Valider que tous les champs sont présents

 Vérifier que le username n'existe pas déjà

 Hasher le password avec bcryptjs.hash(password, 10)

 Créer l'utilisateur avec User.create()

 Émettre auth:register:success ou auth:register:error au frontend

 Stocker l'userId dans la session utilisateur (nécessaire pour les prochains événements)

Tâche 2.5 : Créer un événement Socket.IO pour la connexion
 Créer un événement auth:login que le frontend émet

 Extraire username et password du payload

 Trouver l'utilisateur avec User.findByUsername()

 Si pas trouvé, émettre auth:login:error

 Comparer le password avec bcryptjs.compare(password, user.password_hash)

 Si incorrect, émettre auth:login:error

 Si correct, créer une session : socket.data.userId = user.id

 Émettre auth:login:success avec les infos utilisateur

Tâche 2.6 : Configurer express-session pour Socket.IO
 Importer express-session et connect-pg-simple dans server.js

 Créer le store PostgreSQL pour les sessions

 Configurer express-session avec :

Store PostgreSQL

Secret depuis .env

resave: false

saveUninitialized: false

Cookie sécurisé (httpOnly, sameSite, secure en prod)

 Important : Partager le session middleware entre Express et Socket.IO

 Utiliser io.use() pour appliquer le middleware session aux connexions Socket.IO

Tâche 2.7 : Créer un middleware d'authentification Socket.IO
 Créer middleware/socketAuthMiddleware.js

 Créer une fonction qui vérifie socket.request.session.userId

 Si userId existe, attacher à socket.data.userId et appeler next()

 Si non, appeler next(new Error('Unauthorized'))

 Utiliser io.use() pour appliquer ce middleware globalement

Tâche 2.8 : Tester l'authentification WebSocket
 Créer un client de test avec Socket.IO

 Tenter un événement sans être authentifié (doit échouer)

 S'authentifier via auth:login

 Vérifier que la session est créée

 Tenter à nouveau un événement (doit réussir)

Phase 3 : Backend - Pseudo-terminal sécurisé et sessions
Tâche 3.1 : Associer les terminaux aux utilisateurs authentifiés
 Dans l'événement connection de Socket.IO :

Vérifier que l'utilisateur est authentifié via socket.data.userId

Créer le terminal avec l'ID utilisateur

Stocker dans la Map avec la clé userId:sessionId (pour support multi-sessions futur)

Tâche 3.2 : Créer une session terminal à la connexion
 Créer un événement session:create que le frontend émet

 Optionnellement, extraire un titre depuis le payload

 Créer une session terminal via TerminalSession.create(userId, title, projectPath)

 Attacher socket.data.sessionId à la session créée

 Créer le pseudo-terminal et l'associer à cette session

 Émettre session:created avec l'ID de la session au frontend

Tâche 3.3 : Gérer plusieurs sessions par utilisateur
 Permettre à un utilisateur d'avoir plusieurs sessions terminal simultanément

 Chaque socket peut avoir sa propre session

 La clé dans la Map devient socketId au lieu de userId

 Mais vérifier que l'utilisateur est bien le propriétaire de la session

Tâche 3.4 : Charger l'historique d'une session
 Créer un événement session:load que le frontend émet avec sessionId

 Valider que l'utilisateur est propriétaire de cette session

 Récupérer l'historique via CommandHistory.findBySessionId()

 Émettre session:history avec toutes les commandes et outputs

Tâche 3.5 : Enregistrer chaque commande exécutée
 Créer un service services/commandParser.js qui détecte les commandes complètes

 Détecter quand l'utilisateur a appuyé sur Enter (détection du \r ou \n)

 Parser la commande tapée (nettoyer les caractères spéciaux)

 Enregistrer dans command_history via CommandHistory.create()

 Stocker temporairement l'output jusqu'à la prochaine commande

Tâche 3.6 : Récupérer la liste des sessions de l'utilisateur
 Créer un événement sessions:list que le frontend émet

 Récupérer toutes les sessions de l'utilisateur via TerminalSession.findByUserId()

 Émettre sessions:list:result avec la liste au frontend

Tâche 3.7 : Renommer une session
 Créer un événement session:rename que le frontend émet avec sessionId et newTitle

 Valider que l'utilisateur est propriétaire

 Mettre à jour via TerminalSession.updateTitle()

 Émettre session:renamed avec le nouveau titre

Phase 4 : Backend - Intégration Claude Code
Tâche 4.1 : Tester Claude Code dans node-pty
 Sur ta machine locale, installer Claude Code : npm install -g @anthropic-ai/claude-code

 Authentifier Claude Code : claude auth

 Vérifier qu'il fonctionne : claude --version

 Créer un script de test test-claude-pty.js :

Créer un pseudo-terminal avec node-pty

Écrire cd /chemin/vers/projet\r

Attendre 1 seconde

Écrire claude\r

Logger tous les outputs en temps réel

 Vérifier que Claude démarre correctement

Tâche 4.2 : Créer le service Claude
 Créer services/claudeService.js

 Créer une fonction launchClaude(ptyProcess, projectPath) qui :

Écrit cd ${projectPath}\r dans le pty

Attend 500-1000ms

Écrit claude\r pour lancer Claude Code

Retourne une Promise qui se résout quand Claude démarre (détecter via output)

 Gérer les erreurs :

Projet inexistant

Claude non installé

Pas d'authentification Claude

Tâche 4.3 : Créer un événement Socket.IO pour lancer Claude
 Créer un événement claude:launch que le frontend émet avec projectPath

 Valider que le chemin est sûr (pas de .., pas d'accès système)

 Vérifier que le chemin existe (via fs.existsSync())

 Appeler claudeService.launchClaude()

 Émettre claude:launched ou claude:error au frontend

Tâche 4.4 : Détecter et enregistrer les actions de Claude
 Créer un parser pour détecter quand Claude modifie des fichiers

 Détecter dans l'output :

"Creating file"

"Modifying file"

"Reading file"

Ou d'autres patterns d'output de Claude

 Enregistrer ces actions dans claude_interactions

 Stocker les noms de fichiers modifiés en JSONB

Tâche 4.5 : Gérer les inputs interactifs avec Claude
 Claude Code peut poser des questions interactives

 Passer les inputs normalement via terminal:input (déjà fonctionnel)

 Mais potentiellement détecter les prompts et les highlight au frontend

Phase 5 : Frontend - Interface de connexion et authentification
Tâche 5.1 : Créer le service Socket.IO
 Créer services/socket.js

 Importer socket.io-client

 Créer une instance Socket.IO avec URL http://localhost:3001

 Configurer autoConnect: false (on va connecter manuellement après login)

 Exporter l'instance socket

Tâche 5.2 : Créer un Context d'authentification
 Créer context/AuthContext.jsx

 Créer un Context et Provider

 Stocker l'état : user, isAuthenticated, loading

 Créer les fonctions :

register(username, email, password) : Émettre auth:register

login(username, password) : Émettre auth:login

logout() : Déconnecter le socket et nettoyer l'état

Tâche 5.3 : Créer les composants d'authentification avec shadcn/ui
 Créer components/LoginForm.jsx :

Utiliser les composants shadcn/ui : Input, Button, Card

Champs : username, password

Bouton "Se connecter"

Lien vers inscription

Afficher les erreurs avec un Toast (shadcn/ui toast)

 Créer components/RegisterForm.jsx :

Champs : username, email, password, confirm password

Valider côté client (password === confirm password)

Bouton "S'inscrire"

Lien vers connexion

Tâche 5.4 : Créer les pages Login et Register
 Créer pages/Login.jsx

Importer et afficher <LoginForm />

Styliser avec Tailwind (centré, card avec shadow)

 Créer pages/Register.jsx

Importer et afficher <RegisterForm />

Même style

Tâche 5.5 : Implémenter la logique de connexion au frontend
 Dans LoginForm.jsx :

À la soumission, appeler authContext.login(username, password)

Afficher un spinner pendant la requête

À succès, rediriger vers /app

À erreur, afficher le message d'erreur dans un Toast

Tâche 5.6 : Implémenter la logique d'inscription au frontend
 Dans RegisterForm.jsx :

À la soumission, valider password === confirm password

Appeler authContext.register(username, email, password)

À succès, rediriger vers /login

À erreur, afficher le message d'erreur

Tâche 5.7 : Configurer React Router avec routes protégées
 Dans App.jsx, importer React Router

 Créer un <BrowserRouter> et <Routes>

 Créer un composant ProtectedRoute :

Vérifier isAuthenticated

Si oui, afficher le composant

Si non, rediriger vers /login

 Définir les routes :

/login → <Login />

/register → <Register />

/app → <ProtectedRoute><MainApp /></ProtectedRoute>

/ → redirection vers /app ou /login

Tâche 5.8 : Tester le flux de connexion
 Lancer le backend et le frontend avec docker-compose up

 Créer un compte via /register

 Se connecter via /login

 Vérifier la redirection vers /app

 Rafraîchir la page (la session doit persister)

Phase 6 : Frontend - Terminal et Socket.IO
Tâche 6.1 : Créer le composant Terminal
 Créer components/Terminal.jsx

 Importer xterm et @xterm/addon-fit

 Importer xterm/css/xterm.css

 Créer une ref pour le conteneur du terminal

 Créer une ref pour l'instance xterm

Tâche 6.2 : Initialiser xterm.js
 Dans un useEffect, créer une instance Terminal avec options :

cursorBlink: true

fontSize: 14

fontFamily: 'Menlo, Monaco, "Courier New", monospace'

Thème sombre moderne (compatible shadcn/ui)

 Charger l'addon FitAddon

 Ouvrir le terminal : terminal.open(containerRef.current)

 Appeler fitAddon.fit()

 Cleanup : terminal.dispose() au démontage

Tâche 6.3 : Connecter Socket.IO au terminal
 Dans le même useEffect, écouter terminal:output :

Écrire les données dans xterm : terminal.write(data)

 Écouter les inputs de l'utilisateur :

terminal.onData(data => socket.emit('terminal:input', data))

 Gérer le redimensionnement :

Écouter window.resize

Appeler fitAddon.fit()

Envoyer les dimensions : socket.emit('terminal:resize', { cols, rows })

Tâche 6.4 : Gérer la connexion/déconnexion Socket.IO
 Au montage de MainApp :

Connecter le socket : socket.connect()

Émettre session:create ou session:load selon la situation

 Au démontage :

Tuer le pseudo-terminal côté backend (via disconnect)

Tâche 6.5 : Afficher le terminal dans l'app
 Créer pages/MainApp.jsx

 Importer et afficher <Terminal />

 Créer une mise en page basique avec Tailwind et shadcn/ui

 Pour l'instant, juste le terminal en plein écran (presque)

Tâche 6.6 : Tester le terminal frontend
 Se connecter et accéder à /app

 Vérifier que le terminal s'affiche

 Taper des commandes : ls, pwd, echo "hello"

 Vérifier que les outputs s'affichent correctement

Phase 7 : Frontend - Interface style GPT avec shadcn/ui
Tâche 7.1 : Créer le layout principal
 Dans MainApp.jsx, créer un layout flexbox :

Sidebar à gauche (300px) avec Scroll

Zone principale à droite (flex-grow)

 Utiliser shadcn/ui : Card pour les containers

 Styliser avec Tailwind pour un design moderne

Tâche 7.2 : Créer le composant Sidebar
 Créer components/Sidebar.jsx

 Afficher un header avec le nom de l'utilisateur (utiliser shadcn/ui Card)

 Créer un bouton "Nouvelle session" avec shadcn/ui Button

 Créer une zone scrollable pour la liste des sessions

 Ajouter un bouton logout en bas

Tâche 7.3 : Créer le composant SessionItem
 Créer components/SessionItem.jsx (utiliser shadcn/ui Button ou custom clickable)

 Afficher le titre de la session

 Afficher la date de création (formatée)

 Ajouter un état actif/inactif (highlight la session courante)

 Ajouter un DropdownMenu shadcn/ui pour renommer/supprimer

Tâche 7.4 : Gérer l'état des sessions
 Créer un Context SessionContext pour gérer les sessions

 Stocker : sessions[], currentSessionId, loading

 Créer une fonction fetchSessions() qui émet sessions:list

 Créer une fonction createNewSession() qui émet session:create

 Créer une fonction selectSession(id) qui émet session:load

Tâche 7.5 : Afficher la liste des sessions
 Dans Sidebar, récupérer les sessions du contexte

 Mapper les sessions en <SessionItem /> components

 Utiliser shadcn/ui Skeleton pour le chargement

 Afficher un message vide si aucune session

Tâche 7.6 : Créer une nouvelle session
 Connecter le bouton "Nouvelle session" à createNewSession()

 Émettre session:create au backend

 Ajouter la session à la liste locale

 Sélectionner automatiquement la nouvelle session

 Créer une nouvelle connexion terminal

Tâche 7.7 : Charger l'historique d'une session
 Quand une session est sélectionnée, émettre session:load

 Récupérer l'historique via l'événement session:history:result

 Afficher l'historique dans le terminal (ou dans une zone séparée)

 Potentiellement : afficher les anciennes commandes en grisé

Tâche 7.8 : Ajouter un header au terminal avec shadcn/ui
 Au-dessus du terminal, créer une barre d'outils (shadcn/ui Card)

 Afficher le titre de la session (éditable avec DropdownMenu)

 Ajouter des boutons shadcn/ui : "Clear", "Renommer", "Supprimer"

Phase 8 : Frontend - Intégration Claude Code
Tâche 8.1 : Créer un bouton "Lancer Claude"
 Dans le header du terminal, ajouter un bouton shadcn/ui "Lancer Claude Code"

 Styliser avec une icône (lucide-react)

 Désactiver si aucune session active

Tâche 8.2 : Créer un modal de sélection de projet avec shadcn/ui
 Créer components/ProjectSelectorDialog.jsx

 Utiliser le composant shadcn/ui Dialog

 Afficher un Input pour entrer le chemin du projet

 Boutons "Annuler" et "Lancer Claude" (shadcn/ui Button)

 Valider le chemin avant d'envoyer

Tâche 8.3 : Connecter le bouton au backend
 Au clic sur "Lancer Claude", ouvrir le modal

 Récupérer le projectPath depuis le modal

 Émettre claude:launch avec { projectPath }

 Écouter claude:launched ou claude:error

 Afficher un toast shadcn/ui de succès/erreur

Tâche 8.4 : Afficher l'état de Claude
 Créer un indicateur visuel "Claude actif" dans le header

 Utiliser une petite icône de point vert/rouge (lucide-react)

 Ou un badge shadcn/ui

Tâche 8.5 : Tester l'intégration Claude
 Se connecter et créer une session

 Cliquer sur "Lancer Claude"

 Sélectionner un projet valide

 Vérifier que Claude démarre dans le terminal

 Vérifier que tout s'affiche en temps réel

Phase 9 : Améliorations et polish avec shadcn/ui
Tâche 9.1 : Implémenter les Toasts (notifications)
 Installer shadcn/ui toast : npx shadcn-ui@latest add toast

 Créer un hook custom useToast pour simplifier l'utilisation

 Afficher des toasts pour :

Connexion réussie

Erreur de connexion

Session créée

Claude lancé

Erreurs générales

Tâche 9.2 : Ajouter des animations subtiles
 Utiliser les transitions Tailwind

 Ajouter des hover effects sur les boutons et sessions

 Animer l'apparition/disparition des modals

Tâche 9.3 : Gérer les erreurs globalement
 Créer un composant ErrorBoundary qui catch les erreurs React

 Afficher une erreur gracieuse avec shadcn/ui Card

 Permettre de recharger la page

Tâche 9.4 : Améliorer la performance
 Utiliser useMemo et useCallback pour optimiser

 Paginer la liste des sessions si nombreuses

 Limiter l'historique affiché dans le terminal (dernières 1000 lignes)

Tâche 9.5 : Ajouter des raccourcis clavier
 Ctrl+K : Focus sur la recherche (futur)

 Ctrl+N : Nouvelle session

 Afficher un aide des raccourcis (Dialog shadcn/ui ?)

Tâche 9.6 : Gérer la déconnexion automatique
 Détecter quand Socket.IO se déconnecte

 Afficher un message "Reconnexion..." (avec Spinner shadcn/ui)

 Tenter de se reconnecter automatiquement

 Restaurer l'état après reconnexion

Tâche 9.7 : Mode sombre/clair
 Créer un Context pour le thème

 Utiliser next-themes ou une solution simple

 Ajouter un toggle dans la sidebar

 Appliquer les couleurs du thème à xterm.js aussi

Tâche 9.8 : Responsive design
 Tester sur mobile (ou petits écrans)

 La sidebar devrait devenir un hamburger menu sur mobile

 Utiliser les breakpoints Tailwind et shadcn/ui

 Ajouter un composant Sheet shadcn/ui pour le menu mobile

Phase 10 : Tests et débogage
Tâche 10.1 : Tester le flux complet
 Inscription → Connexion → Nouvelle session → Commandes → Claude

 Fermer et rouvrir une session existante

 Navigation entre plusieurs sessions

 Renommage de session

 Logout → Login → récupération de sessions précédentes

Tâche 10.2 : Tester les cas limites
 Que se passe-t-il si le backend crash ?

 Que se passe-t-il si PostgreSQL est down ?

 Que se passe-t-il si Claude Code n'est pas installé ?

 Connexion simultanée depuis 2 onglets ?

 Fermer le navigateur et rouvrir (session doit persister)

Tâche 10.3 : Tester la sécurité
 Tenter d'accéder au terminal d'un autre utilisateur (impossible via WebSocket)

 Vérifier que les commandes sont bien isolées par utilisateur

 Vérifier les cookies sont httpOnly et sécurisés

 Tester l'injection de caractères spéciaux

Tâche 10.4 : Tester Docker
 Lancer docker-compose up

 Vérifier que tous les services démarrent

 Vérifier que le frontend peut communiquer avec le backend

 Vérifier que le backend peut communiquer avec PostgreSQL

 Vérifier les logs : docker-compose logs -f

Tâche 10.5 : Tester la persistence de données
 Créer une session, exécuter des commandes

 Arrêter les conteneurs

 Redémarrer les conteneurs

 Vérifier que les données sont toujours là

Phase 11 : Déploiement (c'est toi qui le fais)
Documentation pour toi
Pour lancer le projet localement en Docker
bash
docker-compose up
# Backend sur http://localhost:3001
# Frontend sur http://localhost:3000
Structure pour ton déploiement
Backend : Exposer le port 3001 (ou un port de ton choix)

Frontend : Build et servir les assets statiques

PostgreSQL : Besoin d'une persistence de données (volume Docker)

Variables d'environnement : À configurer selon ton déploiement

Ce que tu dois faire toi-même
 Décider de ton infrastructure (VPS, NAS, cloud, etc.)

 Configurer les certificats SSL/HTTPS

 Configurer un reverse proxy (nginx, Traefik, etc.)

 Gérer les backups de PostgreSQL

 Gérer les logs et le monitoring

 Configurer les variables d'environnement pour la production

Phase 12 : Fonctionnalités futures (collaboration 2 users)
Tâche 12.1 : Système de permissions
 Créer une table session_participants :

session_id

user_id

role (owner, editor, viewer)

 Implémenter la logique de partage de session

 Permettre à un owner d'inviter un autre utilisateur

Tâche 12.2 : Rooms Socket.IO pour sessions partagées
 Quand un user rejoint une session, le faire join une room Socket.IO

 Broadcaster les outputs du terminal à tous les participants

 Gérer les permissions (qui peut écrire ?)

Tâche 12.3 : UI pour la collaboration
 Afficher la liste des participants dans la session (avec shadcn/ui)

 Afficher qui tape actuellement

 Ajouter des curseurs multiples (complexe, peut-être version 2)

Tâche 12.4 : Tester la collaboration
 Se connecter avec 2 comptes différents

 Partager une session

 Vérifier que les 2 voient la même chose en temps réel
