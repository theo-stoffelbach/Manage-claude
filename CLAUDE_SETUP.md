# 🤖 Claude Setup Guide

## Installation de Claude CLI dans le Container

Pour utiliser le bouton "Lancer Claude" dans l'interface, vous devez d'abord installer Claude CLI dans le container backend.

### Option 1 : Installation Globale (Recommandé)

```bash
# Entrer dans le container backend
docker exec -it terminal_backend sh

# Installer Claude CLI globalement
npm install -g @anthropics/claude

# Authentifier Claude (nécessite une clé API)
claude auth

# Tester l'installation
claude --version
```

### Option 2 : Installation Locale dans le Projet

```bash
# Depuis votre terminal NAS
cd /volume1/Docker_data/claude-manager-test/backend

# Installer Claude CLI comme dépendance
npm install @anthropics/claude

# Ajouter un script dans package.json
```

Puis ajouter dans `backend/package.json` :
```json
{
  "scripts": {
    "claude": "claude"
  }
}
```

## Configuration de l'API Key

### Méthode 1 : Variable d'environnement

Ajoutez dans votre `docker-compose.yml` :

```yaml
backend:
  environment:
    ANTHROPIC_API_KEY: "votre-clé-api-ici"
```

### Méthode 2 : Fichier .env

Créez un fichier `.env` dans le backend :

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Méthode 3 : Configuration utilisateur

```bash
# Dans le container
docker exec -it terminal_backend sh

# Configurer Claude
claude auth
# Suivre les instructions pour entrer votre clé API
```

## Obtenir une Clé API

1. Allez sur [https://console.anthropic.com](https://console.anthropic.com)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys"
4. Créez une nouvelle clé
5. Copiez la clé (elle commence par `sk-ant-`)

## Utilisation dans l'Interface Web

Une fois Claude CLI installé et configuré :

1. **Connectez-vous** à l'interface web (http://localhost:3005)
2. **Cliquez** sur "Lancer le terminal"
3. **En bas du terminal**, vous verrez le panneau "Claude Assistant"
4. **Cliquez** sur "Lancer Claude"

Le bouton exécutera automatiquement `claude` dans le terminal.

## Commandes Claude Utiles

### Dans le Terminal Web

```bash
# Lancer Claude
claude

# Lancer Claude dans un répertoire spécifique
cd /volume1/Docker_data/Scrum-Clicker
claude

# Aide
claude --help

# Version
claude --version

# Se déconnecter
claude logout
```

### Boutons Rapides Disponibles

L'interface inclut aussi des boutons d'actions rapides :
- **Effacer terminal** - Exécute `clear`
- **Liste fichiers** - Exécute `ls -la`
- **Git status** - Exécute `git status`

## Vérification de l'Installation

```bash
# Test simple
docker exec terminal_backend claude --version

# Si la commande réussit, Claude est installé !
```

## Dépannage

### "claude: command not found"

Claude CLI n'est pas installé. Suivez l'option 1 ci-dessus.

```bash
docker exec -it terminal_backend sh
npm install -g @anthropics/claude
```

### "API key not configured"

Vous devez configurer votre clé API :

```bash
docker exec -it terminal_backend claude auth
# Puis entrez votre clé API
```

### "Permission denied"

Ajoutez les permissions nécessaires :

```bash
docker exec -it terminal_backend chmod +x /usr/local/bin/claude
```

## Alternative : npx

Si vous ne voulez pas installer globalement, vous pouvez utiliser `npx` :

```bash
# Dans le terminal web
npx @anthropics/claude
```

Modifiez alors le bouton dans l'interface pour exécuter `npx @anthropics/claude\r` au lieu de `claude\r`.

---

**Note** : L'utilisation de Claude Code nécessite un compte Anthropic et consomme des crédits API. Consultez [les tarifs](https://www.anthropic.com/pricing) pour plus d'informations.
