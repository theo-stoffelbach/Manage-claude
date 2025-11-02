# Tests Backend - Claude Manager

## Structure des tests

```
backend/src/__tests__/
├── setup.ts                    # Configuration globale des tests
├── middleware/
│   ├── auth.test.ts           # Tests du middleware d'authentification
│   └── errorHandler.test.ts   # Tests de gestion des erreurs
├── utils/
│   ├── crypto.test.ts         # Tests de chiffrement/déchiffrement
│   ├── promptUtils.test.ts    # Tests des utilitaires de prompts
│   └── validation.test.ts     # Tests des schémas Zod
└── services/
    └── authService.test.ts    # Tests du service d'authentification
```

## Commandes

### Exécuter tous les tests
```bash
npm test
```

### Exécuter les tests en mode watch
```bash
npm run test:watch
```

### Générer un rapport de couverture
```bash
npm run test:coverage
```

### Exécuter les tests en mode verbose
```bash
npm run test:verbose
```

### Exécuter un fichier de test spécifique
```bash
npm test -- auth.test.ts
```

### Exécuter les tests d'un dossier spécifique
```bash
npm test -- middleware
```

## Couverture des tests

### Middleware
- ✅ **auth.test.ts** : Authentification JWT, génération et vérification de tokens
- ✅ **errorHandler.test.ts** : Gestion centralisée des erreurs, codes HTTP

### Utils
- ✅ **crypto.test.ts** : Chiffrement/déchiffrement AES des clés API
- ✅ **promptUtils.test.ts** : Extraction variables, fragments, remplacement
- ✅ **validation.test.ts** : Validation Zod de tous les schémas d'entrée

### Services
- ✅ **authService.test.ts** : Hashage bcrypt, validation emails/passwords

## Variables d'environnement de test

Les tests utilisent des valeurs par défaut définies dans `setup.ts` :
- `JWT_SECRET` : Secret de test pour JWT
- `ENCRYPTION_SECRET` : Secret de test pour AES
- `MONGODB_URI` : Base de données de test

## Bonnes pratiques

1. **Isolation** : Chaque test doit être indépendant
2. **Mocking** : Utiliser des mocks pour les dépendances externes (DB, API)
3. **Nommage** : Décrire clairement ce que teste chaque test
4. **AAA Pattern** : Arrange, Act, Assert
5. **Coverage** : Viser minimum 80% de couverture

## Ajouter de nouveaux tests

### Template de base

```typescript
import { functionToTest } from '../../path/to/function';

describe('Feature Name', () => {
  describe('functionToTest', () => {
    it('should do something expected', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Tests asynchrones

```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Tests avec mocks

```typescript
jest.mock('../../services/externalService');

it('should use mocked service', () => {
  const mockService = require('../../services/externalService');
  mockService.method.mockReturnValue('mocked value');
  
  const result = functionUsingService();
  expect(result).toBe('mocked value');
});
```

## Résolution de problèmes

### Les tests échouent avec "Cannot find module"
```bash
# Réinstaller les dépendances
cd backend
npm install
```

### Timeouts sur les tests asynchrones
```typescript
// Augmenter le timeout pour un test spécifique
it('slow test', async () => {
  // test code
}, 10000); // 10 secondes
```

### Erreurs de types TypeScript
```bash
# Vérifier la configuration TypeScript
npx tsc --noEmit
```

## CI/CD

Les tests s'exécutent automatiquement sur :
- Chaque push sur les branches
- Chaque Pull Request
- Avant le déploiement en production

## Métriques de qualité

Objectifs de couverture :
- **Statements** : > 80%
- **Branches** : > 75%
- **Functions** : > 80%
- **Lines** : > 80%

## Tests à ajouter (TODO)

- [ ] Tests d'intégration avec MongoDB
- [ ] Tests des controllers
- [ ] Tests des routes Express
- [ ] Tests de performance
- [ ] Tests E2E avec supertest

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)

