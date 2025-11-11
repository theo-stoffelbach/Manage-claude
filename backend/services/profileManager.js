const fs = require('fs').promises;
const path = require('path');

/**
 * ProfileManager - Gestion des profils Claude multi-comptes
 *
 * Permet de gérer plusieurs comptes Claude en switchant entre les fichiers
 * .credentials.json stockés dans /root/.claude/profiles/
 *
 * Chaque profil contient les OAuth tokens Claude (access + refresh tokens)
 * valides pendant 90 jours.
 */
class ProfileManager {
  constructor() {
    this.CLAUDE_DIR = '/root/.claude';
    this.PROFILES_DIR = path.join(this.CLAUDE_DIR, 'profiles');
    this.ACTIVE_CREDENTIALS = path.join(this.CLAUDE_DIR, '.credentials.json');
    this.ACTIVE_PROFILE_FILE = path.join(this.CLAUDE_DIR, '.active-profile.txt');
    this.ensureDirectories();
  }

  /**
   * Crée les dossiers nécessaires s'ils n'existent pas
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(this.PROFILES_DIR, { recursive: true });
      console.log('✅ Dossier profiles initialisé');
    } catch (err) {
      console.error('❌ Erreur création dossier profiles:', err.message);
    }
  }

  /**
   * Liste tous les profils disponibles
   * @returns {Promise<Array>} Liste des profils avec leurs infos
   */
  async listProfiles() {
    try {
      const files = await fs.readdir(this.PROFILES_DIR);
      const profiles = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const email = file.replace('.json', '');
          const profilePath = path.join(this.PROFILES_DIR, file);

          try {
            const data = JSON.parse(await fs.readFile(profilePath, 'utf8'));
            const isValid = await this.isTokenValid(data);
            const expiresAt = data.claudeAiOauth?.expiresAt;
            const daysLeft = expiresAt ? Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)) : null;

            profiles.push({
              email,
              subscriptionType: data.claudeAiOauth?.subscriptionType || 'unknown',
              expiresAt,
              daysLeft,
              isValid,
              hasRefreshToken: !!data.claudeAiOauth?.refreshToken,
            });
          } catch (err) {
            profiles.push({
              email,
              error: err.message,
              isValid: false,
            });
          }
        }
      }

      return profiles;
    } catch (err) {
      console.error('❌ Erreur listProfiles:', err.message);
      return [];
    }
  }

  /**
   * Récupère le profil actif
   * @returns {Promise<string|null>} Email du profil actif
   */
  async getActiveProfile() {
    try {
      const email = await fs.readFile(this.ACTIVE_PROFILE_FILE, 'utf8');
      return email.trim();
    } catch {
      return null;
    }
  }

  /**
   * Change le profil actif
   * @param {string} email - Email du profil à activer
   */
  async setActiveProfile(email) {
    const profilePath = path.join(this.PROFILES_DIR, `${email}.json`);

    // Vérifier que le profil existe
    try {
      await fs.access(profilePath);
    } catch {
      throw new Error(`Le profil ${email} n'existe pas`);
    }

    // Copier le profil vers .credentials.json
    await fs.copyFile(profilePath, this.ACTIVE_CREDENTIALS);

    // Marquer comme actif
    await fs.writeFile(this.ACTIVE_PROFILE_FILE, email, 'utf8');

    console.log(`✅ Profil actif changé vers : ${email}`);
  }

  /**
   * Sauvegarde le profil actuel
   * @param {string} email - Email du profil
   */
  async saveCurrentProfile(email) {
    // Lire le .credentials.json actuel
    const currentCreds = await fs.readFile(this.ACTIVE_CREDENTIALS, 'utf8');

    // Sauvegarder dans profiles/
    const profilePath = path.join(this.PROFILES_DIR, `${email}.json`);
    await fs.writeFile(profilePath, currentCreds, 'utf8');

    // Marquer comme actif
    await fs.writeFile(this.ACTIVE_PROFILE_FILE, email, 'utf8');

    console.log(`💾 Profil sauvegardé : ${email}`);
  }

  /**
   * Crée un nouveau profil vide
   * @param {string} email - Email du profil à créer
   */
  async createProfile(email) {
    const profilePath = path.join(this.PROFILES_DIR, `${email}.json`);

    // Vérifier si existe déjà
    try {
      await fs.access(profilePath);
      throw new Error(`Le profil ${email} existe déjà`);
    } catch (err) {
      if (err.message.includes('existe déjà')) throw err;
    }

    // Créer un profil vide
    const emptyProfile = {
      claudeAiOauth: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        scopes: [],
        subscriptionType: null,
      },
    };

    await fs.writeFile(profilePath, JSON.stringify(emptyProfile, null, 2), 'utf8');
    console.log(`➕ Profil créé : ${email}`);
  }

  /**
   * Supprime un profil
   * @param {string} email - Email du profil à supprimer
   */
  async deleteProfile(email) {
    const profilePath = path.join(this.PROFILES_DIR, `${email}.json`);
    await fs.unlink(profilePath);

    // Si c'était le profil actif, le désactiver
    const activeProfile = await this.getActiveProfile();
    if (activeProfile === email) {
      try {
        await fs.unlink(this.ACTIVE_PROFILE_FILE);
      } catch {
        // Fichier n'existe pas, pas grave
      }
    }

    console.log(`🗑️  Profil supprimé : ${email}`);
  }

  /**
   * Récupère les infos d'un profil
   * @param {string} email - Email du profil
   * @returns {Promise<Object>} Infos du profil
   */
  async getProfileInfo(email) {
    const profilePath = path.join(this.PROFILES_DIR, `${email}.json`);
    const data = JSON.parse(await fs.readFile(profilePath, 'utf8'));

    const expiresAt = data.claudeAiOauth?.expiresAt;
    const now = Date.now();
    const daysLeft = expiresAt ? Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24)) : null;

    return {
      email,
      subscriptionType: data.claudeAiOauth?.subscriptionType || 'unknown',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      daysLeft,
      isValid: daysLeft !== null && daysLeft > 0,
      hasRefreshToken: !!data.claudeAiOauth?.refreshToken,
    };
  }

  /**
   * Vérifie si le token est valide
   * @param {Object} credentialsData - Données du fichier credentials
   * @returns {Promise<boolean>}
   */
  async isTokenValid(credentialsData) {
    const expiresAt = credentialsData.claudeAiOauth?.expiresAt;
    if (!expiresAt) return false;

    const now = Date.now();
    return expiresAt > now;
  }

  /**
   * Importe le profil actuellement actif dans Claude CLI
   * @param {string} email - Email du profil à importer
   */
  async importCurrentProfile(email) {
    // Lire le .credentials.json
    const currentCreds = await fs.readFile(this.ACTIVE_CREDENTIALS, 'utf8');
    const data = JSON.parse(currentCreds);

    // Vérifier qu'il est valide
    const isValid = await this.isTokenValid(data);
    if (!isValid) {
      throw new Error('Le token actuel est expiré. Authentifiez-vous d\'abord avec Claude CLI.');
    }

    // Sauvegarder
    await this.saveCurrentProfile(email);

    console.log(`📥 Profil importé : ${email}`);
  }
}

// Export singleton
module.exports = new ProfileManager();
