# ⚡ Quick Start - Claude Prompt Manager

## 🚀 Lancer le projet en 3 commandes

```bash
# 1. Build les images Docker (première fois seulement)
docker-compose build

# 2. Démarrer tous les services
docker-compose up -d

# 3. Vérifier que tout fonctionne
docker-compose ps
```

**C'est tout !** 🎉

---

## 🌐 Accéder à l'application

**Frontend** : http://localhost:3005
**Backend API** : http://localhost:3105/api
**Health Check** : http://localhost:3105/health

---

## 👤 Premier test

1. Ouvrir http://localhost:3005
2. **Créer un compte** :
   - Cliquer sur "Register here"
   - Email : `test@example.com`
   - Password : `password123`
3. **Ajouter un compte Claude** :
   - Aller dans **Accounts**
   - Cliquer **Add Account**
   - Nom : `Mon compte`
   - API Key : `sk-ant-...` (votre clé Claude)
4. **Créer un prompt** :
   - Aller dans **Prompts**
   - Cliquer **New Prompt**
   - Remplir et sauvegarder

---

## 📊 Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Rebuild après modification
docker-compose build
docker-compose up -d
```

---

## ❓ Problèmes ?

Voir **DEPLOYMENT.md** pour le guide complet et le debugging.

---

**Services démarrés** :
- 🗄️ MongoDB (port 27017)
- 🔧 Backend Express (port 3105)
- 🎨 Frontend React Vite (port 3005)
