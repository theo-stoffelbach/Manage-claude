import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ProfileSelector - Composant pour gérer les profils Claude multi-comptes
 *
 * Permet de :
 * - Lister tous les profils disponibles
 * - Voir le profil actif
 * - Changer de profil actif
 * - Créer de nouveaux profils
 * - Importer le profil actuel de Claude CLI
 * - Supprimer des profils
 */
function ProfileSelector({ socket }) {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [importProfileEmail, setImportProfileEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Charger la liste des profils au montage
  useEffect(() => {
    if (!socket) return;

    // Demander la liste des profils
    socket.emit('profiles:list');

    // Écouter les réponses du serveur
    socket.on('profiles:list-response', ({ profiles, activeProfile }) => {
      setProfiles(profiles);
      setActiveProfile(activeProfile);
      setIsLoading(false);
    });

    socket.on('profiles:active-changed', ({ email }) => {
      setActiveProfile(email);
      setSuccessMessage(`Profil changé vers ${email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      // Recharger la liste pour mettre à jour les infos
      socket.emit('profiles:list');
    });

    socket.on('profiles:created', ({ email }) => {
      setSuccessMessage(`Profil créé : ${email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowCreateModal(false);
      setNewProfileEmail('');
      socket.emit('profiles:list');
    });

    socket.on('profiles:imported', ({ email }) => {
      setSuccessMessage(`Profil importé : ${email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowImportModal(false);
      setImportProfileEmail('');
      socket.emit('profiles:list');
    });

    socket.on('profiles:saved', ({ email }) => {
      setSuccessMessage(`Profil sauvegardé : ${email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      socket.emit('profiles:list');
    });

    socket.on('profiles:deleted', ({ email }) => {
      setSuccessMessage(`Profil supprimé : ${email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      socket.emit('profiles:list');
    });

    socket.on('profiles:error', ({ error }) => {
      setError(error);
      setIsLoading(false);
      setTimeout(() => setError(null), 5000);
    });

    socket.on('profiles:launch-claude', ({ email }) => {
      // Envoyer la commande claude au terminal
      socket.emit('terminal:input', 'claude\r');
      setSuccessMessage(`✅ Claude lancé avec le profil ${email}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    });

    return () => {
      socket.off('profiles:list-response');
      socket.off('profiles:active-changed');
      socket.off('profiles:created');
      socket.off('profiles:imported');
      socket.off('profiles:saved');
      socket.off('profiles:deleted');
      socket.off('profiles:error');
      socket.off('profiles:launch-claude');
    };
  }, [socket]);

  const handleSetActive = (email) => {
    if (!socket) return;
    setIsLoading(true);
    socket.emit('profiles:set-active', { email });
  };

  const handleSetActiveAndLaunch = (email) => {
    if (!socket) return;
    setIsLoading(true);
    socket.emit('profiles:set-active-and-launch', { email });
  };

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!socket || !newProfileEmail) return;

    if (!newProfileEmail.includes('@')) {
      setError('Email invalide');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    socket.emit('profiles:create', { email: newProfileEmail });
  };

  const handleImportProfile = (e) => {
    e.preventDefault();
    if (!socket || !importProfileEmail) return;

    if (!importProfileEmail.includes('@')) {
      setError('Email invalide');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    socket.emit('profiles:import-current', { email: importProfileEmail });
  };

  const handleDeleteProfile = (email) => {
    if (!socket) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le profil ${email} ?`)) return;

    setIsLoading(true);
    socket.emit('profiles:delete', { email });
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return 'Non défini';
    const date = new Date(expiresAt);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpiryColor = (daysLeft) => {
    if (!daysLeft || daysLeft <= 0) return 'text-red-500';
    if (daysLeft < 7) return 'text-orange-500';
    if (daysLeft < 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Profils Claude</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            Importer le profil actif
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            Créer un profil
          </button>
        </div>
      </div>

      {/* Messages de succès et d'erreur */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900 border border-green-700 text-green-200 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Liste des profils */}
      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-2">Aucun profil disponible</p>
            <p className="text-sm">Cliquez sur "Importer le profil actif" pour commencer</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.email}
              className={`p-4 rounded-lg border-2 transition-all ${
                profile.email === activeProfile
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {profile.email}
                    </h3>
                    {profile.email === activeProfile && (
                      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                        Actif
                      </span>
                    )}
                  </div>

                  {profile.error ? (
                    <p className="text-red-400 text-sm">{profile.error}</p>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        Type: <span className="text-white">{profile.subscriptionType}</span>
                      </p>
                      {profile.expiresAt && (
                        <>
                          <p className="text-gray-400">
                            Expire le: <span className="text-white">{formatExpiry(profile.expiresAt)}</span>
                          </p>
                          <p className="text-gray-400">
                            Jours restants:{' '}
                            <span className={getExpiryColor(profile.daysLeft)}>
                              {profile.daysLeft > 0 ? `${profile.daysLeft} jours` : 'Expiré'}
                            </span>
                          </p>
                        </>
                      )}
                      <p className="text-gray-400">
                        Statut:{' '}
                        <span className={profile.isValid ? 'text-green-400' : 'text-red-400'}>
                          {profile.isValid ? 'Valide' : 'Invalide'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {profile.email !== activeProfile && profile.isValid && (
                    <>
                      <button
                        onClick={() => handleSetActiveAndLaunch(profile.email)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors font-semibold"
                        disabled={isLoading}
                      >
                        Activer & Lancer
                      </button>
                      <button
                        onClick={() => handleSetActive(profile.email)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        disabled={isLoading}
                      >
                        Activer
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteProfile(profile.email)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    disabled={isLoading || profile.email === activeProfile}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Créer un profil */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Créer un nouveau profil</h3>
            <form onSubmit={handleCreateProfile}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email du profil</label>
                <input
                  type="email"
                  value={newProfileEmail}
                  onChange={(e) => setNewProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="exemple@email.com"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Créera un profil vide. Vous devrez vous authentifier avec Claude CLI ensuite.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProfileEmail('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  disabled={isLoading}
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Importer le profil actif */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Importer le profil actif</h3>
            <form onSubmit={handleImportProfile}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email du profil</label>
                <input
                  type="email"
                  value={importProfileEmail}
                  onChange={(e) => setImportProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="exemple@email.com"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Importe le profil actuellement authentifié dans Claude CLI.
                  Vous devez être connecté avec Claude CLI avant d&apos;importer.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportProfileEmail('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  disabled={isLoading}
                >
                  Importer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

ProfileSelector.propTypes = {
  socket: PropTypes.object.isRequired,
};

export default ProfileSelector;
