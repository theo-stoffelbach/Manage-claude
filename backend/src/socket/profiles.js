const profileManager = require('../../services/profileManager');

/**
 * Socket handlers pour la gestion des profils Claude multi-comptes
 *
 * Events émis par le client :
 * - profiles:list
 * - profiles:get-active
 * - profiles:set-active
 * - profiles:create
 * - profiles:import-current
 * - profiles:save-current
 * - profiles:delete
 * - profiles:get-info
 *
 * Events émis vers le client :
 * - profiles:list-response
 * - profiles:active-response
 * - profiles:active-changed
 * - profiles:created
 * - profiles:imported
 * - profiles:saved
 * - profiles:deleted
 * - profiles:info-response
 * - profiles:error
 */
function setupProfileHandlers(io, socket) {
  console.log(`[Profiles] Client ${socket.id} connected`);

  /**
   * Lister tous les profils disponibles
   */
  socket.on('profiles:list', async () => {
    try {
      console.log(`[Profiles] Listing profiles for ${socket.id}`);
      const profiles = await profileManager.listProfiles();
      const activeProfile = await profileManager.getActiveProfile();

      socket.emit('profiles:list-response', {
        profiles,
        activeProfile,
      });

      console.log(`[Profiles] Found ${profiles.length} profiles, active: ${activeProfile || 'none'}`);
    } catch (error) {
      console.error('[Profiles] Error listing profiles:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Obtenir le profil actif
   */
  socket.on('profiles:get-active', async () => {
    try {
      const activeProfile = await profileManager.getActiveProfile();
      socket.emit('profiles:active-response', { activeProfile });
    } catch (error) {
      console.error('[Profiles] Error getting active profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Changer de profil actif
   */
  socket.on('profiles:set-active', async ({ email }) => {
    try {
      console.log(`[Profiles] Switching to profile: ${email}`);
      await profileManager.setActiveProfile(email);

      socket.emit('profiles:active-changed', { email });

      // Notifier tous les autres clients
      socket.broadcast.emit('profiles:active-changed', { email });

      console.log(`[Profiles] ✅ Profile switched to ${email}`);
    } catch (error) {
      console.error('[Profiles] Error setting active profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Changer de profil actif ET lancer Claude automatiquement
   */
  socket.on('profiles:set-active-and-launch', async ({ email }) => {
    try {
      console.log(`[Profiles] Switching to profile and launching Claude: ${email}`);
      await profileManager.setActiveProfile(email);

      socket.emit('profiles:active-changed', { email });

      // Notifier tous les autres clients
      socket.broadcast.emit('profiles:active-changed', { email });

      // Envoyer la commande claude au terminal après un court délai
      setTimeout(() => {
        socket.emit('profiles:launch-claude', { email });
        console.log(`[Profiles] ✅ Profile switched to ${email}, launching Claude...`);
      }, 500);
    } catch (error) {
      console.error('[Profiles] Error setting active profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Créer un nouveau profil (vide)
   */
  socket.on('profiles:create', async ({ email }) => {
    try {
      console.log(`[Profiles] Creating new profile: ${email}`);

      // Validation email
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }

      await profileManager.createProfile(email);
      socket.emit('profiles:created', { email });

      console.log(`[Profiles] ✅ Profile created: ${email}`);
    } catch (error) {
      console.error('[Profiles] Error creating profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Importer le profil actuellement actif dans Claude CLI
   */
  socket.on('profiles:import-current', async ({ email }) => {
    try {
      console.log(`[Profiles] Importing current profile as: ${email}`);

      // Validation email
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }

      await profileManager.importCurrentProfile(email);
      socket.emit('profiles:imported', { email });

      console.log(`[Profiles] ✅ Profile imported: ${email}`);
    } catch (error) {
      console.error('[Profiles] Error importing profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Sauvegarder le profil actuel
   */
  socket.on('profiles:save-current', async ({ email }) => {
    try {
      console.log(`[Profiles] Saving current profile as: ${email}`);

      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }

      await profileManager.saveCurrentProfile(email);
      socket.emit('profiles:saved', { email });

      console.log(`[Profiles] ✅ Profile saved: ${email}`);
    } catch (error) {
      console.error('[Profiles] Error saving profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Supprimer un profil
   */
  socket.on('profiles:delete', async ({ email }) => {
    try {
      console.log(`[Profiles] Deleting profile: ${email}`);

      await profileManager.deleteProfile(email);
      socket.emit('profiles:deleted', { email });

      // Notifier tous les autres clients
      socket.broadcast.emit('profiles:deleted', { email });

      console.log(`[Profiles] ✅ Profile deleted: ${email}`);
    } catch (error) {
      console.error('[Profiles] Error deleting profile:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });

  /**
   * Obtenir les infos d'un profil spécifique
   */
  socket.on('profiles:get-info', async ({ email }) => {
    try {
      const info = await profileManager.getProfileInfo(email);
      socket.emit('profiles:info-response', { email, info });
    } catch (error) {
      console.error('[Profiles] Error getting profile info:', error.message);
      socket.emit('profiles:error', { error: error.message });
    }
  });
}

module.exports = setupProfileHandlers;
