# CLAUDE.md - Gestionnaire Claude (Back + Front TS + Docker)

## Vue d'ensemble du projet
Application web pour gérer les prompts Claude. Déploiement via **Docker Compose** avec Backend Node.js/Express/TypeScript + Frontend React/TypeScript + MongoDB.

**Architecture** : Backend + Frontend + MongoDB (tous en Docker)

**Déploiement** : Docker Compose (reverse proxy géré en amont)

---

## Stack technologique

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express
- **Langage** : TypeScript
- **Base données** : MongoDB (Mongoose ODM)
- **Auth** : JWT + bcryptjs
- **Validation** : Zod
- **Chiffrement** : crypto-js

### Frontend
- **Framework** : React 18+
- **Build** : Vite
- **Langage** : TypeScript
- **Routing** : React Router v6
- **State** : Zustand
- **HTTP** : Axios
- **UI** : Tailwind CSS + lucide-react

### Infrastructure
- **Orchestration** : Docker Compose (3 services)
- **Service 1** : Backend Express
- **Service 2** : Frontend (app statique)
- **Service 3** : MongoDB

---

## Structure du projet

Backend structure :
- `src/controllers/` - Logique endpoints
- `src/services/` - Business logic
- `src/models/` - Schémas Mongoose
- `src/routes/` - Définition routes
- `src/middleware/` - Auth, validation, errors
- `src/utils/` - Utilitaires (crypto, validators)
- `src/config/` - Configuration
- `src/types/` - Types TypeScript

Frontend structure :
- `src/components/` - Composants React
- `src/hooks/` - Custom hooks
- `src/store/` - Zustand stores
- `src/pages/` - Pages/routes
- `src/services/` - API client
- `src/types/` - Types TypeScript
- `public/` - Actifs statiques

---

## Conventions de code TypeScript

### Imports
Ordre : stdlib → npm → types → local

```typescript
import { createHash } from 'crypto';
import express from 'express';
import type { IUser } from '../types';
import { validateEmail } from '../utils/validators';
```

### Async/Await
Toujours try/catch, pas d'erreurs silencieuses

```typescript
async function createAccount(userId: string, data: any) {
  try {
    if (!data.apiKey) throw new ValidationError('API key required');
    
    const encrypted = encryptApiKey(data.apiKey);
    const account = await Account.create({ ...data, apiKey: encrypted });
    
    return account;
  } catch (error) {
    logger.error('createAccount:', error);
    throw error;
  }
}
```

### Types et interfaces
- **Interfaces** pour modèles : `interface IUser { ... }`
- **Types** pour unions : `type ApiMethod = 'GET' | 'POST'`
- **Enums** pour constantes : `enum AccountType { Personal, Work }`

```typescript
interface IAccount {
  _id: string;
  userId: string;
  name: string;
  type: 'personal' | 'work' | 'custom';
  apiKey: string; // Chiffré
  isActive: boolean;
  createdAt: Date;
}

interface IPrompt {
  _id: string;
  userId: string;
  accountId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  version: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Nommage
- **Fichiers** : `camelCase.ts` ou `PascalCase.tsx`
- **Fonctions** : `camelCase`
- **Constants** : `UPPER_SNAKE_CASE`
- **Interfaces** : `IPascalCase`
- **Types** : `PascalCase`

---

## Modèles MongoDB

### User
```typescript
interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
```

### Account
```typescript
interface IAccount {
  _id: string;
  userId: string;
  name: string;
  type: 'personal' | 'work' | 'custom';
  apiKey: string; // Chiffré avant sauvegarde
  isActive: boolean;
  createdAt: Date;
}
```

### Prompt
```typescript
interface IPrompt {
  _id: string;
  userId: string;
  accountId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  version: number;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### PromptHistory
```typescript
interface IPromptHistory {
  _id: string;
  promptId: string;
  version: number;
  content: string;
  createdAt: Date;
}
```

### Fragment
```typescript
interface IFragment {
  _id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Authentification et sécurité

### JWT Middleware
```typescript
export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError('No token');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### Chiffrement API keys
**CRITICAL** : API keys doivent être chiffrées avant sauvegarde en BD

```typescript
export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_SECRET!).toString();
}

export function decryptApiKey(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, process.env.ENCRYPTION_SECRET!);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Utilisation
const encrypted = encryptApiKey(userApiKey);
await Account.create({ ...data, apiKey: encrypted }); // Stocké chiffré
// Ne JAMAIS retourner la clé déchiffrée au frontend
```

### Validation Zod
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createAccountSchema = z.object({
  name: z.string().min(1),
  apiKey: z.string().min(1),
  type: z.enum(['personal', 'work', 'custom']),
});

// Dans controller
const parsed = registerSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ errors: parsed.error.flatten() });
}
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` → {email, password}
- `POST /api/auth/login` → {email, password}
- `GET /api/auth/me` → current user (protected)

### Accounts
- `POST /api/accounts` → create
- `GET /api/accounts` → list
- `GET /api/accounts/:id` → get one
- `PUT /api/accounts/:id` → update
- `DELETE /api/accounts/:id` → delete
- `POST /api/accounts/:id/set-active` → set active

### Prompts
- `POST /api/prompts` → create
- `GET /api/prompts?category=X&tags=Y&search=Z` → list with filters
- `GET /api/prompts/:id` → get one
- `PUT /api/prompts/:id` → update (auto-save version)
- `DELETE /api/prompts/:id` → delete
- `GET /api/prompts/:id/history` → versions
- `POST /api/prompts/:id/restore` → restore version
- `POST /api/prompts/:id/fill` → fill variables

### Fragments
- `POST /api/fragments` → create
- `GET /api/fragments` → list
- `DELETE /api/fragments/:id` → delete

---

## Frontend - Zustand Store

### Auth Store
```typescript
interface AuthStore {
  token: string | null;
  user: IUser | null;
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },
  
  hydrate: () => {
    // Au load
  },
}));
```

### Prompt Store
```typescript
interface PromptStore {
  prompts: IPrompt[];
  currentPrompt: IPrompt | null;
  setPrompts: (prompts: IPrompt[]) => void;
  setCurrentPrompt: (prompt: IPrompt) => void;
  addPrompt: (prompt: IPrompt) => void;
  updatePrompt: (id: string, updates: Partial<IPrompt>) => void;
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  currentPrompt: null,
  setPrompts: (prompts) => set({ prompts }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  addPrompt: (prompt) => set((state) => ({ 
    prompts: [...state.prompts, prompt] 
  })),
  updatePrompt: (id, updates) => set((state) => ({
    prompts: state.prompts.map((p) => 
      p._id === id ? { ...p, ...updates } : p
    ),
  })),
}));
```

---

## Frontend - Axios + Interceptors

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor : ajouter token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor : gérer 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Variables et fragments dans prompts

### Détecter variables
```typescript
export function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  return [...new Set(Array.from(content.matchAll(regex), m => m[1]))];
}
```

### Remplir variables
```typescript
export function fillVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => 
    values[key] || `{{${key}}}`
  );
}
```

### Fragments
```typescript
export async function composePrompt(prompt: IPrompt): Promise<string> {
  let content = prompt.content;
  
  const fragmentRegex = /\{\{fragment:(\w+)\}\}/g;
  for (const match of content.matchAll(fragmentRegex)) {
    const fragmentName = match[1];
    const fragment = await Fragment.findOne({ name: fragmentName });
    if (fragment) {
      content = content.replace(match[0], fragment.content);
    }
  }
  
  return content;
}
```

---

## Docker Compose

Services :
- **backend** : Express app
- **frontend** : React static app
- **mongodb** : Database

Networks : Services communiquent ensemble
Volumes : Data MongoDB persistante

Variables d'env requises :
- `MONGODB_URI` - Connection string
- `JWT_SECRET` - JWT secret
- `ENCRYPTION_SECRET` - Chiffrement clés
- `NODE_ENV` - production/development

---

## Déploiement Docker

Build et start :
```bash
docker-compose build
docker-compose up -d
```

Vérifier :
```bash
docker-compose ps
docker-compose logs -f backend
```

---

## Commandes Docker utiles

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Redémarrer service
docker-compose restart backend

# Rebuild image
docker-compose build backend
docker-compose up -d backend
```

---

## Pièges et attention

### Sécurité
1. **API keys** : Jamais exposées au frontend, toujours chiffrées en BD
2. **JWT** : Secret long et aléatoire
3. **CORS** : Limiter aux domaines autorisés
4. **.env.production** : Ne jamais committer

### Performance
- Indexer userId, accountId en MongoDB
- Paginer les listes
- Cache localStorage (frontend)

### Erreurs courantes
- MongoDB connection refusée → vérifier docker-compose
- Port déjà utilisé → changer port
- CORS errors → vérifier config backend
- Token expiré → gestion 401

---

Voir **todo.md** pour roadmap détaillée phase par phase.
01~fdsfsdfdsf::dsd:
sqdqsf
dsvcx
vwcx
v
xv
dwfd# CLAUDE.md - Gestionnaire Claude (Back + Front TS + Docker)

## Vue d'ensemble du projet
Application web pour gérer les prompts Claude. Déploiement via **Docker Compose** avec Backend Node.js/Express/TypeScript + Frontend React/TypeScript + MongoDB.

**Architecture** : Backend + Frontend + MongoDB (tous en Docker)

**Déploiement** : Docker Compose (reverse proxy géré en amont)

---

## Stack technologique

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express
- **Langage** : TypeScript
- **Base données** : MongoDB (Mongoose ODM)
- **Auth** : JWT + bcryptjs
- **Validation** : Zod
- **Chiffrement** : crypto-js

### Frontend
- **Framework** : React 18+
- **Build** : Vite
- **Langage** : TypeScript
- **Routing** : React Router v6
- **State** : Zustand
- **HTTP** : Axios
- **UI** : Tailwind CSS + lucide-react

### Infrastructure
- **Orchestration** : Docker Compose (3 services)
- **Service 1** : Backend Express
- **Service 2** : Frontend (app statique)
- **Service 3** : MongoDB

---

## Structure du projet

Backend structure :
- `src/controllers/` - Logique endpoints
- `src/services/` - Business logic
- `src/models/` - Schémas Mongoose
- `src/routes/` - Définition routes
- `src/middleware/` - Auth, validation, errors
- `src/utils/` - Utilitaires (crypto, validators)
- `src/config/` - Configuration
- `src/types/` - Types TypeScript

Frontend structure :
- `src/components/` - Composants React
- `src/hooks/` - Custom hooks
- `src/store/` - Zustand stores
- `src/pages/` - Pages/routes
- `src/services/` - API client
- `src/types/` - Types TypeScript
- `public/` - Actifs statiques

---

## Conventions de code TypeScript

### Imports
Ordre : stdlib → npm → types → local

```typescript
import { createHash } from 'crypto';
import express from 'express';
import type { IUser } from '../types';
import { validateEmail } from '../utils/validators';
```

### Async/Await
Toujours try/catch, pas d'erreurs silencieuses

```typescript
async function createAccount(userId: string, data: any) {
  try {
    if (!data.apiKey) throw new ValidationError('API key required');
    
    const encrypted = encryptApiKey(data.apiKey);
    const account = await Account.create({ ...data, apiKey: encrypted });
    
    return account;
  } catch (error) {
    logger.error('createAccount:', error);
    throw error;
  }
}
```

### Types et interfaces
- **Interfaces** pour modèles : `interface IUser { ... }`
- **Types** pour unions : `type ApiMethod = 'GET' | 'POST'`
- **Enums** pour constantes : `enum AccountType { Personal, Work }`

```typescript
interface IAccount {
  _id: string;
  userId: string;
  name: string;
  type: 'personal' | 'work' | 'custom';
  apiKey: string; // Chiffré
  isActive: boolean;
  createdAt: Date;
}

interface IPrompt {
  _id: string;
  userId: string;
  accountId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  version: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Nommage
- **Fichiers** : `camelCase.ts` ou `PascalCase.tsx`
- **Fonctions** : `camelCase`
- **Constants** : `UPPER_SNAKE_CASE`
- **Interfaces** : `IPascalCase`
- **Types** : `PascalCase`

---

## Modèles MongoDB

### User
```typescript
interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
```

### Account
```typescript
interface IAccount {
  _id: string;
  userId: string;
  name: string;
  type: 'personal' | 'work' | 'custom';
  apiKey: string; // Chiffré avant sauvegarde
  isActive: boolean;
  createdAt: Date;
}
```

### Prompt
```typescript
interface IPrompt {
  _id: string;
  userId: string;
  accountId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  version: number;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### PromptHistory
```typescript
interface IPromptHistory {
  _id: string;
  promptId: string;
  version: number;
  content: string;
  createdAt: Date;
}
```

### Fragment
```typescript
interface IFragment {
  _id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Authentification et sécurité

### JWT Middleware
```typescript
export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError('No token');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### Chiffrement API keys
**CRITICAL** : API keys doivent être chiffrées avant sauvegarde en BD

```typescript
export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_SECRET!).toString();
}

export function decryptApiKey(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, process.env.ENCRYPTION_SECRET!);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Utilisation
const encrypted = encryptApiKey(userApiKey);
await Account.create({ ...data, apiKey: encrypted }); // Stocké chiffré
// Ne JAMAIS retourner la clé déchiffrée au frontend
```

### Validation Zod
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createAccountSchema = z.object({
  name: z.string().min(1),
  apiKey: z.string().min(1),
  type: z.enum(['personal', 'work', 'custom']),
});

// Dans controller
const parsed = registerSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ errors: parsed.error.flatten() });
}
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` → {email, password}
- `POST /api/auth/login` → {email, password}
- `GET /api/auth/me` → current user (protected)

### Accounts
- `POST /api/accounts` → create
- `GET /api/accounts` → list
- `GET /api/accounts/:id` → get one
- `PUT /api/accounts/:id` → update
- `DELETE /api/accounts/:id` → delete
- `POST /api/accounts/:id/set-active` → set active

### Prompts
- `POST /api/prompts` → create
- `GET /api/prompts?category=X&tags=Y&search=Z` → list with filters
- `GET /api/prompts/:id` → get one
- `PUT /api/prompts/:id` → update (auto-save version)
- `DELETE /api/prompts/:id` → delete
- `GET /api/prompts/:id/history` → versions
- `POST /api/prompts/:id/restore` → restore version
- `POST /api/prompts/:id/fill` → fill variables

### Fragments
- `POST /api/fragments` → create
- `GET /api/fragments` → list
- `DELETE /api/fragments/:id` → delete

---

## Frontend - Zustand Store

### Auth Store
```typescript
interface AuthStore {
  token: string | null;
  user: IUser | null;
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },
  
  hydrate: () => {
    // Au load
  },
}));
```

### Prompt Store
```typescript
interface PromptStore {
  prompts: IPrompt[];
  currentPrompt: IPrompt | null;
  setPrompts: (prompts: IPrompt[]) => void;
  setCurrentPrompt: (prompt: IPrompt) => void;
  addPrompt: (prompt: IPrompt) => void;
  updatePrompt: (id: string, updates: Partial<IPrompt>) => void;
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  currentPrompt: null,
  setPrompts: (prompts) => set({ prompts }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  addPrompt: (prompt) => set((state) => ({ 
    prompts: [...state.prompts, prompt] 
  })),
  updatePrompt: (id, updates) => set((state) => ({
    prompts: state.prompts.map((p) => 
      p._id === id ? { ...p, ...updates } : p
    ),
  })),
}));
```

---

## Frontend - Axios + Interceptors

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor : ajouter token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor : gérer 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Variables et fragments dans prompts

### Détecter variables
```typescript
export function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  return [...new Set(Array.from(content.matchAll(regex), m => m[1]))];
}
```

### Remplir variables
```typescript
export function fillVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => 
    values[key] || `{{${key}}}`
  );
}
```

### Fragments
```typescript
export async function composePrompt(prompt: IPrompt): Promise<string> {
  let content = prompt.content;
  
  const fragmentRegex = /\{\{fragment:(\w+)\}\}/g;
  for (const match of content.matchAll(fragmentRegex)) {
    const fragmentName = match[1];
    const fragment = await Fragment.findOne({ name: fragmentName });
    if (fragment) {
      content = content.replace(match[0], fragment.content);
    }
  }
  
  return content;
}
```

---

## Docker Compose

Services :
- **backend** : Express app
- **frontend** : React static app
- **mongodb** : Database

Networks : Services communiquent ensemble
Volumes : Data MongoDB persistante

Variables d'env requises :
- `MONGODB_URI` - Connection string
- `JWT_SECRET` - JWT secret
- `ENCRYPTION_SECRET` - Chiffrement clés
- `NODE_ENV` - production/development

---

## Déploiement Docker

Build et start :
```bash
docker-compose build
docker-compose up -d
```

Vérifier :
```bash
docker-compose ps
docker-compose logs -f backend
```

---

## Commandes Docker utiles

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Redémarrer service
docker-compose restart backend

# Rebuild image
docker-compose build backend
docker-compose up -d backend
```

---

## Pièges et attention

### Sécurité
1. **API keys** : Jamais exposées au frontend, toujours chiffrées en BD
2. **JWT** : Secret long et aléatoire
3. **CORS** : Limiter aux domaines autorisés
4. **.env.production** : Ne jamais committer

### Performance
- Indexer userId, accountId en MongoDB
- Paginer les listes
- Cache localStorage (frontend)

### Erreurs courantes
- MongoDB connection refusée → vérifier docker-compose
- Port déjà utilisé → changer port
- CORS errors → vérifier config backend
- Token expiré → gestion 401

---

Voir **todo.md** pour roadmap détaillée phase par phase.
