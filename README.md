# Claude Prompt Manager

Application web pour gérer vos prompts Claude avec support multi-comptes.

## Stack Technologique

### Backend
- **Node.js 18+** + **Express** + **TypeScript**
- **MongoDB** (Mongoose ODM)
- **JWT** pour l'authentification
- **Zod** pour la validation
- **crypto-js** pour le chiffrement des API keys

### Frontend
- **React 18+** + **TypeScript**
- **Vite** pour le build
- **React Router v6** pour le routing
- **Zustand** pour le state management
- **Axios** pour les requêtes HTTP
- **Tailwind CSS** pour le styling
- **react-hot-toast** pour les notifications

### Infrastructure
- **Docker** + **Docker Compose**
- **Nginx** pour servir le frontend en production

## Architecture

```
claude-manager/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── types/
│   └── Dockerfile
├── frontend/         # React App
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── Dockerfile
└── docker-compose.yml
```

## Installation

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Configuration

1. Cloner le repository :
```bash
git clone <repo-url>
cd claude-manager
```

2. Copier les fichiers d'environnement :
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **IMPORTANT** : Modifier `.env` et générer des secrets forts :
```bash
# Générer des secrets aléatoires (Linux/macOS)
openssl rand -base64 32  # Pour JWT_SECRET
openssl rand -base64 32  # Pour ENCRYPTION_SECRET
```

### Démarrage avec Docker

```bash
# Build et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v
```

Services disponibles :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **MongoDB** : localhost:27017

### Développement local

#### Backend
```bash
cd backend
npm install
npm run dev  # Démarre en mode watch avec tsx
```

#### Frontend
```bash
cd frontend
npm install
npm run dev  # Démarre Vite dev server sur port 5173
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel (protected)

### Comptes Claude
- `POST /api/accounts` - Créer un compte
- `GET /api/accounts` - Liste des comptes
- `GET /api/accounts/:id` - Récupérer un compte
- `PUT /api/accounts/:id` - Modifier un compte
- `DELETE /api/accounts/:id` - Supprimer un compte
- `POST /api/accounts/:id/set-active` - Définir comme actif

### Prompts
- `POST /api/prompts` - Créer un prompt
- `GET /api/prompts` - Liste avec filtres (category, tags, search)
- `GET /api/prompts/:id` - Récupérer un prompt
- `PUT /api/prompts/:id` - Modifier un prompt
- `DELETE /api/prompts/:id` - Supprimer un prompt
- `GET /api/prompts/:id/history` - Historique des versions
- `POST /api/prompts/:id/restore` - Restaurer une version
- `POST /api/prompts/:id/fill` - Remplir les variables

### Fragments
- `POST /api/fragments` - Créer un fragment
- `GET /api/fragments` - Liste des fragments
- `DELETE /api/fragments/:id` - Supprimer un fragment

## Fonctionnalités

### ✅ Implémentées
- Structure du projet (Phase 1)
- Configuration Docker

### 🚧 En cours
- Modèles MongoDB
- Authentification JWT
- CRUD Comptes
- CRUD Prompts
- Interface utilisateur

### 📋 À venir
- Gestion des variables dans les prompts `{{variable}}`
- Fragments réutilisables `{{fragment:nom}}`
- Versioning automatique des prompts
- Historique et restauration
- Tests unitaires et d'intégration

## Sécurité

### Points critiques
1. **API Keys** : Toujours chiffrées en base de données avec `crypto-js`
2. **JWT Secrets** : Minimum 32 caractères aléatoires
3. **CORS** : Configuré pour autoriser uniquement le frontend
4. **Validation** : Tous les inputs validés avec Zod
5. **Headers** : Helmet.js pour les headers de sécurité

### Bonnes pratiques
- Ne jamais committer `.env` ou `.env.production`
- Générer des secrets forts pour la production
- Les API keys ne sont jamais retournées déchiffrées au frontend
- Utiliser HTTPS en production

## Scripts

### Backend
```bash
npm run dev      # Mode développement avec watch
npm run build    # Build TypeScript → dist/
npm start        # Démarre le serveur compilé
npm run lint     # Lint avec ESLint
npm test         # Tests Jest
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # Build pour production
npm run preview  # Preview du build
npm run lint     # Lint avec ESLint
```

## Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Déploiement

Voir le fichier [CLAUDE.md](./claude.md) pour les instructions détaillées de déploiement sur le NAS UGREEN.

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## License

MIT

## Auteurs

- Theo S.
- Lucas R.
