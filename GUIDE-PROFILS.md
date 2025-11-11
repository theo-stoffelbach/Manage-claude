# Guide d'utilisation - Système Multi-Profils Claude

## 📋 Vue d'ensemble

Le système de multi-profils permet de gérer plusieurs comptes Claude différents et de basculer entre eux facilement depuis l'interface web.

## 🎯 Cas d'usage

- Travailler avec plusieurs comptes Claude (personnel, professionnel, client)
- Basculer rapidement entre différents abonnements
- Gérer des projets avec différentes identités Claude

## 🚀 Guide rapide

### 1. Accéder au gestionnaire de profils

1. Ouvrez l'application Claude Manager dans votre navigateur
2. Connectez-vous avec votre compte
3. Cliquez sur "Terminal" pour afficher le terminal
4. Cliquez sur **"Profils Claude"** pour déplier le panneau de gestion

### 2. Importer votre profil actuel

Si vous avez déjà un compte Claude actif sur le système :

1. Cliquez sur **"Importer le profil actif"**
2. Entrez l'email associé à ce compte (ex: `theo.stoffelbach@sii.fr`)
3. Cliquez sur **"Importer"**

✅ Votre profil est maintenant sauvegardé et géré par le système !

### 3. Ajouter d'autres profils

**Option A : Importer un autre compte déjà authentifié**

1. Authentifiez-vous d'abord avec Claude CLI dans le terminal :
   ```bash
   claude
   ```
2. Suivez le processus d'authentification OAuth
3. Une fois connecté, importez ce nouveau profil avec son email

**Option B : Créer un profil vide pour plus tard**

1. Cliquez sur **"Créer un profil"**
2. Entrez l'email du compte
3. Le profil sera créé vide (vous devrez vous authentifier plus tard)

### 4. Basculer entre profils

**Option A : Activer et lancer automatiquement (recommandé)**

1. Dans la liste des profils, cliquez sur **"Activer & Lancer"** (bouton vert) à côté du profil souhaité
2. Le profil devient actif ET Claude se lance automatiquement dans le terminal
3. Vous pouvez immédiatement commencer à travailler avec le nouveau compte

**Option B : Activer seulement (sans lancer Claude)**

1. Cliquez sur **"Activer"** (bouton bleu) à côté du profil souhaité
2. Le profil devient actif
3. Lancez manuellement Claude avec la commande `claude` quand vous êtes prêt

### 5. Supprimer un profil

1. Cliquez sur **"Supprimer"** à côté du profil à retirer
2. Confirmez la suppression
3. Le profil est définitivement supprimé (⚠️ action irréversible)

## 📊 Informations affichées

Pour chaque profil, vous pouvez voir :

- **Email** : L'adresse email du compte Claude
- **Type** : Type d'abonnement (Pro, Free, etc.)
- **Expiration** : Date d'expiration des tokens OAuth
- **Jours restants** : Nombre de jours avant expiration
- **Statut** : Valide ✅ ou Invalide ❌
- **Badge "Actif"** : Indique le profil actuellement utilisé

## 🔐 Sécurité et durée de validité

### Durée de vie des tokens

- **Access Token** : ~8 heures (renouvelé automatiquement)
- **Refresh Token** : ~90 jours
- **Re-authentification requise** : Tous les 3 mois environ

### Couleurs d'avertissement

Les jours restants sont colorés selon l'urgence :

- 🟢 **Vert** : > 30 jours restants
- 🟡 **Jaune** : 7-30 jours restants
- 🟠 **Orange** : < 7 jours restants
- 🔴 **Rouge** : Expiré

## 🛠️ Architecture technique

### Stockage des profils

Les profils sont stockés dans `/root/.claude/profiles/` avec un fichier par profil :

```
/root/.claude/
├── .credentials.json          # Profil actuellement actif
├── .active-profile.txt        # Email du profil actif
└── profiles/
    ├── theo.stoffelbach@sii.fr.json
    ├── contact@autre-compte.fr.json
    └── projet-client@email.com.json
```

### Format d'un profil

Chaque fichier `.json` contient :

```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1762879294852,
    "scopes": ["user:inference", "user:profile"],
    "subscriptionType": "pro"
  }
}
```

### Comment ça marche ?

1. **Changement de profil** : Copie le fichier du profil vers `.credentials.json`
2. **Sauvegarde** : Copie `.credentials.json` vers `profiles/{email}.json`
3. **Claude CLI** : Lit automatiquement `.credentials.json` pour s'authentifier

## 🔄 Workflow typique

### Exemple : Travailler sur 3 projets différents

```
9h00 - Projet Personnel (compte perso@email.com)
  → Clic sur "Activer & Lancer" pour "perso@email.com"
  → Claude démarre automatiquement avec ce compte
  → Travailler sur le projet

14h00 - Projet Client A (compte client-a@entreprise.com)
  → Clic sur "Activer & Lancer" pour "client-a@entreprise.com"
  → Claude redémarre automatiquement avec le compte client
  → Développer pour le client

17h00 - Projet Interne (compte travail@societe.fr)
  → Clic sur "Activer & Lancer" pour "travail@societe.fr"
  → Claude redémarre automatiquement avec le compte pro
  → Finaliser les tâches
```

**Temps de changement de profil** : ~2 secondes ⚡

## ⚠️ Points d'attention

### Ne fonctionne PAS

- ❌ Partager un même profil entre plusieurs machines simultanément (tokens révoqués)
- ❌ Utiliser un profil avec un token expiré (re-authentification requise)

### Bonnes pratiques

- ✅ Importez tous vos comptes dès le début
- ✅ Surveillez les dates d'expiration
- ✅ Re-authentifiez-vous ~15 jours avant expiration
- ✅ Nommez vos profils avec des emails explicites

## 🐛 Résolution de problèmes

### Erreur : "Le token actuel est expiré"

**Solution** : Re-authentifiez-vous avec Claude CLI puis réimportez le profil

```bash
claude
# Suivre le processus OAuth
# Puis dans l'interface : "Importer le profil actif"
```

### Erreur : "Le profil {email} n'existe pas"

**Solution** : Le fichier de profil a été supprimé ou déplacé manuellement

1. Créez un nouveau profil avec cet email
2. Authentifiez-vous avec Claude CLI
3. Importez à nouveau le profil

### Un profil apparaît comme "Invalide"

**Causes possibles** :
- Token expiré (> 90 jours)
- Fichier JSON corrompu
- Refresh token révoqué

**Solution** : Supprimez et recréez le profil

## 📚 Commandes utiles

### Vérifier les profils manuellement

```bash
# Lister les profils
ls -la /root/.claude/profiles/

# Voir le profil actif
cat /root/.claude/.active-profile.txt

# Inspecter un profil
cat /root/.claude/profiles/email@example.com.json | jq .
```

### Backup des profils

```bash
# Sauvegarder tous les profils
tar -czf claude-profiles-backup-$(date +%Y%m%d).tar.gz /root/.claude/profiles/

# Restaurer
tar -xzf claude-profiles-backup-20241111.tar.gz -C /
```

## 🎉 Avantages du système

1. **Pas de re-authentification constante** : Les tokens durent 90 jours
2. **Changement instantané** : Basculer entre comptes en 1 clic
3. **Lancement automatique** : Claude démarre automatiquement avec le bon profil
4. **Interface visuelle** : Pas besoin de ligne de commande
5. **Monitoring** : Voir l'état et expiration de tous les comptes
6. **Multi-projets** : Gérer facilement plusieurs clients/projets
7. **Ultra-rapide** : ~2 secondes pour changer de compte et être opérationnel

---

**Dernière mise à jour** : 11 novembre 2025
**Version** : 1.0
**Auteur** : Theo S. & Claude Code
