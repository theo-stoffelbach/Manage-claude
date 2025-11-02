# TODO - Gestionnaire Claude (Back + Front TS + Docker)

## Vue d'ensemble du projet
Application web pour gérer les prompts Claude et plusieurs comptes. Déploiement via **Docker Compose** avec Backend Node.js/Express/TypeScript + Frontend React/TypeScript + MongoDB.

---

## Phase 1 : Configuration et architecture

### 1.1 Initialisation du repo
- [ ] Créer repo Git `claude-manager`
- [ ] Structure monorepo

### 1.2 Backend - Initialisation TypeScript
- [ ] Créer dossier `backend/` avec structure :
  - `src/controllers/`
  - `src/services/`
  - `src/models/`
  - `src/routes/`
  - `src/middleware/`
  - `src/utils/`
  - `src/config/`
  - `src/types/`
- [ ] Initialiser TypeScript
- [ ] Configurer `tsconfig.json`
- [ ] `package.json` avec dépendances

### 1.3 Frontend - Initialisation React Vite
- [ ] Créer app React TypeScript avec Vite
- [ ] Structure frontend :
  - `src/components/`
  - `src/hooks/`
  - `src/store/`
  - `src/pages/`
  - `src/services/`
  - `src/types/`
  - `public/`
- [ ] Configurer pour build statique

### 1.4 Docker - Fichiers de base
- [ ] `Dockerfile` pour backend (Node.js)
- [ ] `Dockerfile` pour frontend (build + serve)
- [ ] `.dockerignore` pour chaque service
- [ ] `docker-compose.yml` avec 3 services (backend, frontend, mongodb)

### 1.5 Configuration
- [ ] `.env.example` avec variables requises
- [ ] `.env.production` (ne pas committer)
- [ ] `.gitignore` (node_modules, .env, dist)

---

## Phase 2 : Backend - Modèles et base données

### 2.1 Configuration MongoDB
- [ ] Setup connexion Mongoose
- [ ] Configuration docker-compose pour MongoDB

### 2.2 Schémas Mongoose
- [ ] Modèle `User` (email, passwordHash, createdAt)
- [ ] Modèle `Account` (userId, name, type, apiKey chiffré, isActive, createdAt)
- [ ] Modèle `Prompt` (userId, accountId, title, content, category, tags, variables, version, usageCount, createdAt, updatedAt)
- [ ] Modèle `PromptHistory` (promptId, version, content, createdAt)
- [ ] Modèle `Fragment` (userId, name, content, createdAt, updatedAt)

### 2.3 Validation avec Zod
- [ ] Schemas Zod pour chaque modèle
- [ ] Validation Register, Login, CreateAccount, CreatePrompt

---

## Phase 3 : Backend - Authentification et sécurité

### 3.1 Routes Auth
- [ ] `POST /api/auth/register` - Inscription
- [ ] `POST /api/auth/login` - Connexion
- [ ] `GET /api/auth/me` - Utilisateur actuel (protected)

### 3.2 JWT Middleware
- [ ] Vérification tokens JWT
- [ ] Validation signature
- [ ] Gestion erreurs auth (401)

### 3.3 Chiffrement API keys
- [ ] Fonction encryptApiKey
- [ ] Fonction decryptApiKey
- [ ] Chiffrer avant sauvegarde en BD
- [ ] Ne jamais retourner clé déchiffrée au frontend

### 3.4 Sécurité globale
- [ ] Helmet.js headers
- [ ] CORS configuration
- [ ] Input validation systématique

---

## Phase 4 : Backend - Gestion des comptes

### 4.1 Endpoints Accounts
- [ ] `POST /api/accounts` - Créer
- [ ] `GET /api/accounts` - Lister
- [ ] `GET /api/accounts/:id` - Récupérer
- [ ] `PUT /api/accounts/:id` - Modifier
- [ ] `DELETE /api/accounts/:id` - Supprimer
- [ ] `POST /api/accounts/:id/set-active` - Définir actif

### 4.2 Service Accounts
- [ ] Validation API key avec Anthropic API
- [ ] Chiffrement API key automatique
- [ ] Gestion isActive (un seul actif par user)

---

## Phase 5 : Backend - Gestion des prompts

### 5.1 Endpoints Prompts
- [ ] `POST /api/prompts` - Créer
- [ ] `GET /api/prompts?category=X&tags=Y&search=Z` - Lister avec filtres
- [ ] `GET /api/prompts/:id` - Récupérer
- [ ] `PUT /api/prompts/:id` - Modifier (auto-save version)
- [ ] `DELETE /api/prompts/:id` - Supprimer
- [ ] `GET /api/prompts/:id/history` - Historique
- [ ] `POST /api/prompts/:id/restore` - Restaurer version
- [ ] `POST /api/prompts/:id/fill` - Remplir variables

### 5.2 Service Prompts
- [ ] `extractVariables(content)` - Parse `{{variable}}`
- [ ] `fillVariables(content, values)` - Remplace variables
- [ ] Versioning automatique
- [ ] Pagination pour listes

### 5.3 Fragments
- [ ] `POST /api/fragments` - Créer
- [ ] `GET /api/fragments` - Lister
- [ ] `DELETE /api/fragments/:id` - Supprimer
- [ ] Parser `{{fragment:nom}}` dans prompts

---

## Phase 6 : Frontend - Initialisation React

### 6.1 Vite + React TypeScript
- [ ] Template React Vite
- [ ] Configuration build statique
- [ ] React Router v6

### 6.2 Configuration dev/prod
- [ ] `vite.config.ts` avec API proxy (dev)
- [ ] Build optimisé pour production

---

## Phase 7 : Frontend - Authentification

### 7.1 Pages et formulaires
- [ ] Page `/login` - Formulaire email/password
- [ ] Page `/register` - Inscription
- [ ] Validation côté client Zod
- [ ] Redirect post-login

### 7.2 Store Auth (Zustand)
- [ ] `setAuth(token, user)` - Stocker token + user
- [ ] `logout()` - Nettoyer
- [ ] Persistance localStorage
- [ ] Hydrate au chargement

### 7.3 API Interceptors
- [ ] Axios instance avec Bearer token auto
- [ ] Gestion 401 (token expiré)
- [ ] Erreurs cohérentes

---

## Phase 8 : Frontend - Gestion des comptes

### 8.1 Page `/accounts`
- [ ] Liste des comptes
- [ ] Bouton "Ajouter compte"
- [ ] Cards pour chaque compte
- [ ] Actions : Set Active, Edit, Delete

### 8.2 Composants
- [ ] `AccountList` - Affiche liste
- [ ] `AccountCard` - Une carte
- [ ] `AddAccountForm` - Création
- [ ] `EditAccountModal` - Modification

---

## Phase 9 : Frontend - Bibliothèque prompts

### 9.1 Page `/prompts` - Layout
- [ ] Barre de recherche
- [ ] Filtres : category, tags
- [ ] Liste prompts paginée
- [ ] Bouton créer nouveau

### 9.2 Composants affichage
- [ ] `PromptList` - Grille/liste
- [ ] `PromptCard` - Title, category, tags, actions
- [ ] `SearchBar` - Recherche texte
- [ ] `FilterPanel` - Filtres
- [ ] Pagination : 10-20 items par page

### 9.3 Détails et variables
- [ ] `PromptViewer` - Affiche contenu
- [ ] Auto-détection variables
- [ ] Formulaire dynamique pour remplir
- [ ] Aperçu prompt rempli
- [ ] Copier au clipboard

### 9.4 CRUD Prompts
- [ ] `CreatePromptForm`
- [ ] `EditPromptModal`
- [ ] Confirmation suppression

### 9.5 Historique
- [ ] Afficher versions passées
- [ ] Restaurer version antérieure

---

## Phase 10 : Frontend - UX et design

### 10.1 Styling
- [ ] Tailwind CSS ou alternative
- [ ] Layout responsive
- [ ] Thème cohérent

### 10.2 Navigation
- [ ] Navbar avec menu
- [ ] Lien logout
- [ ] Active state sur routes

### 10.3 Notifications
- [ ] react-hot-toast pour messages
- [ ] Success/Error/Info

---

## Phase 11 : Docker et déploiement

### 11.1 Docker Compose
- [ ] Image Node.js backend
- [ ] Image Nginx/Node frontend
- [ ] Image MongoDB
- [ ] Networks pour communication
- [ ] Volumes persistants pour data

### 11.2 Build images
- [ ] Build backend : `docker build -t claude-backend ./backend`
- [ ] Build frontend : `docker build -t claude-frontend ./frontend`

### 11.3 Déploiement
- [ ] `docker-compose up -d` pour démarrer
- [ ] Vérifier services running
- [ ] Vérifier logs

### 11.4 Troubleshooting
- [ ] MongoDB connection
- [ ] Port conflicts
- [ ] CORS errors
- [ ] Logs pour debug

---

## Phase 12 : Tests et qualité

### 12.1 Tests Backend
- [ ] Jest + ts-jest config
- [ ] Tests services
- [ ] Tests routes API
- [ ] Couverture 80% min

### 12.2 Tests Frontend
- [ ] Vitest + React Testing Library
- [ ] Tests composants
- [ ] Tests hooks
- [ ] Couverture 70% min

### 12.3 Linting
- [ ] ESLint + Prettier
- [ ] Pre-commit hooks

---

## Phase 13 : Maintenance

### 13.1 Logs et monitoring
- [ ] Logs backend
- [ ] Logs MongoDB
- [ ] Erreurs critiques

### 13.2 Backups MongoDB
- [ ] Script backup MongoDB
- [ ] Retention policy

### 13.3 Redémarrage
- [ ] Script restart après reboot
- [ ] Health checks

---

## Phase 14 : Évolutions futures (v1.1+)

- [ ] Sync Git automatique
- [ ] Partage de prompts
- [ ] WebSockets collaborations
- [ ] Export/import bibliothèques
- [ ] API publique

---

## Stack final
- **Backend** : Node.js 18+ + Express + TypeScript
- **Frontend** : React 18+ + Vite + TypeScript
- **Database** : MongoDB en Docker
- **Container** : Docker + Docker Compose
- **Auth** : JWT + bcryptjs
- **Validation** : Zod
- **Chiffrement** : crypto-js
