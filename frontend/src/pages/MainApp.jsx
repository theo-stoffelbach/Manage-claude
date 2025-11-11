import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Terminal from '../components/Terminal';
import Logo from '../components/Logo';
import ProfileSelector from '../components/ProfileSelector';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Zap, Code2, Sparkles, LogOut, User, Play, Clock, Bot, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, Users } from 'lucide-react';
import socket from '../services/socket';

export default function MainApp() {
  const { user, logout } = useAuth();
  const [showTerminal, setShowTerminal] = useState(false);
  const [claudeConnecting, setClaudeConnecting] = useState(false);
  const [claudeStatus, setClaudeStatus] = useState(null);
  const [claudeInfo, setClaudeInfo] = useState({
    installed: null,
    loggedIn: null,
    username: null,
    plan: null,
    model: null,
    checking: true, // Start with checking = true to hide buttons initially
    initialCheckDone: false // Track if initial auto-check is done
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState(null); // 'theme', 'oauth', 'complete'
  const [oauthUrl, setOauthUrl] = useState(null); // Store OAuth URL for display
  const [enterSent, setEnterSent] = useState(false); // Track if we already sent Enter for login confirmation
  const [showProfiles, setShowProfiles] = useState(false); // Toggle profile selector visibility

  // Run Claude check when terminal is opened
  useEffect(() => {
    if (showTerminal && !claudeInfo.initialCheckDone) {
      console.log('🎯 Terminal opened - Running Claude check after delay...');

      // Wait for terminal to be fully ready (2 seconds)
      const checkTimeout = setTimeout(() => {
        console.log('📤 Sending Claude check command...');
        const command = 'node /volume1/Docker_data/claude-manager-test/check-claude-logged-in.js';
        socket.emit('terminal:input', command + '\r');
        console.log('✅ Command sent to terminal');
      }, 2000);

      return () => clearTimeout(checkTimeout);
    }
  }, [showTerminal, claudeInfo.initialCheckDone]);

  // Handle terminal output from Terminal component (via callback)
  const handleTerminalOutput = useCallback((data) => {
    const output = data.toString();

    // Debug: Log all output to see what we receive
    if (output.includes('CLAUDE') || output.includes('claude') || output.includes('Claude')) {
      console.log('🔍 Terminal output with CLAUDE:', output);
    }

    // Debug: Log ALL output during authentication to catch "Logged in as" messages
    if (isAuthenticating) {
      console.log('🔐 [AUTH] Terminal output:', output.substring(0, 200)); // First 200 chars
    }

    // Check for installation status
    if (output.includes('CLAUDE_INSTALLED')) {
      console.log('✅ Detected CLAUDE_INSTALLED');
      setClaudeInfo(prev => ({ ...prev, installed: true, checking: false, initialCheckDone: true }));
    } else if (output.includes('CLAUDE_NOT_INSTALLED')) {
      console.log('❌ Detected CLAUDE_NOT_INSTALLED');
      setClaudeInfo(prev => ({ ...prev, installed: false, loggedIn: false, checking: false, initialCheckDone: true }));
    }

    // Check for login status
    if (output.includes('CLAUDE_NOT_LOGGED_IN')) {
      console.log('⚠️  Detected CLAUDE_NOT_LOGGED_IN');
      setClaudeInfo(prev => ({ ...prev, loggedIn: false, username: null, plan: null, model: null, checking: false, initialCheckDone: true }));
    }

    // Check for logged in status
    if (output.includes('CLAUDE_LOGGED_IN')) {
      console.log('✅ Detected CLAUDE_LOGGED_IN');
      setClaudeInfo(prev => ({ ...prev, loggedIn: true, checking: false, initialCheckDone: true }));
    }

    // === AUTHENTICATION FLOW DETECTION ===

    // Detect if Claude is already authenticated (shows the main interface)
    // Only trigger if we're NOT in the OAuth flow (to avoid conflict with OAuth completion)
    if (isAuthenticating && !authStep && (output.includes('Try "refactor') || output.includes('? for shortcuts'))) {
      console.log('✅ Claude is already authenticated!');
      setClaudeInfo(prev => ({ ...prev, loggedIn: true }));
      setIsAuthenticating(false);
      setAuthStep('complete');
      setClaudeStatus('✅ Vous êtes déjà authentifié ! Claude est prêt à utiliser.');
      setTimeout(() => {
        setClaudeStatus(null);
        setAuthStep(null);
      }, 5000);
    }

    // Detect theme selection screen (not authenticated)
    if (isAuthenticating && output.includes("Let's get started") && output.includes('Choose the text style')) {
      console.log('📋 Theme selection detected - auto-selecting...');
      setAuthStep('theme');
      setClaudeStatus('Sélection du thème automatique...');

      // Send 2 enters after a short delay to select default theme and proceed
      setTimeout(() => {
        console.log('📤 Sending first Enter...');
        socket.emit('terminal:input', '\r');

        setTimeout(() => {
          console.log('📤 Sending second Enter...');
          socket.emit('terminal:input', '\r');
        }, 500);
      }, 1000);
    }

    // Detect OAuth URL and copy to clipboard
    // Check if OAuth URL is present in the output (more reliable than checking for text first)
    const urlMatch = output.match(/(https:\/\/claude\.ai\/oauth\/authorize\?[^\s]+)/);

    if (isAuthenticating && urlMatch && urlMatch[1] && authStep !== 'oauth') {
      const detectedUrl = urlMatch[1];
      console.log('🔗 OAuth URL detected:', detectedUrl);
      setAuthStep('oauth');
      setOauthUrl(detectedUrl); // Store for display

      // Try to copy to clipboard - but don't rely on it due to security restrictions
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(detectedUrl)
          .then(() => {
            console.log('✅ OAuth URL copied to clipboard!');
            setClaudeStatus('🔗 Lien copié ! Cliquez sur "Copier le lien" ci-dessous si ça n\'a pas fonctionné.');
          })
          .catch(err => {
            console.error('❌ Failed to copy to clipboard:', err);
            setClaudeStatus('🔗 Cliquez sur "Copier le lien" ci-dessous pour copier le lien d\'authentification.');
          });
      } else {
        console.warn('⚠️ Clipboard API not available');
        setClaudeStatus('🔗 Cliquez sur "Copier le lien" ci-dessous pour copier le lien d\'authentification.');
      }
    }

    // Detect "Logged in as" which appears after pasting the OAuth code
    // This is more reliable than waiting for the full "Press Enter to continue" message
    if (isAuthenticating && authStep === 'oauth' && !enterSent && output.includes('Logged in as')) {
      console.log('✅ Login successful detected with "Logged in as" - Auto-pressing Enter twice...');
      setClaudeStatus('✅ Connexion réussie ! Finalisation...');
      setEnterSent(true); // Mark that we sent Enter to avoid sending multiple times

      // Wait a bit longer to ensure the full message is displayed, then press Enter twice
      setTimeout(() => {
        console.log('📤 Sending first Enter...');
        socket.emit('terminal:input', '\r');

        setTimeout(() => {
          console.log('📤 Sending second Enter...');
          socket.emit('terminal:input', '\r');
        }, 500);
      }, 1000);
    }

    // Detect successful authentication completion (after Enter is pressed)
    // IMPORTANT: Only trigger this AFTER we've detected "Logged in as" and sent Enter (enterSent = true)
    // This waits for the actual prompt/interface to appear after authentication
    // Look for interface elements like "Try" or "?" that appear after successful login
    if (isAuthenticating && authStep === 'oauth' && enterSent && (output.includes('Try "refactor') || output.includes('? for shortcuts'))) {
      console.log('✅ Authentication completed - Claude interface detected!');
      setClaudeInfo(prev => ({ ...prev, loggedIn: true }));
      setIsAuthenticating(false);
      setAuthStep('complete');
      setClaudeStatus('✅ Authentification réussie ! Claude est maintenant connecté.');
      setTimeout(() => {
        setClaudeStatus(null);
        setAuthStep(null);
        setOauthUrl(null); // Clear OAuth URL
        setEnterSent(false); // Reset for next auth
        checkClaudeStatus(); // Refresh status
      }, 3000);
    }

    // Parse welcome message for account info
    // Example: "Welcome back, Le S! You're using Claude Sonnet 4.5 on your Claude Pro plan."
    const welcomeMatch = output.match(/Welcome back,\s+([^!]+)!/);
    const modelMatch = output.match(/Claude\s+([^,\s]+(?:\s+[0-9.]+)?)/);
    const planMatch = output.match(/Claude\s+(Pro|Free)/);

    if (welcomeMatch) {
      const username = welcomeMatch[1].trim();
      const model = modelMatch ? modelMatch[1].trim() : null;
      const plan = planMatch ? planMatch[1].trim() : null;

      setClaudeInfo(prev => ({
        ...prev,
        loggedIn: true,
        username: username,
        model: model,
        plan: plan
      }));
    }

    // Alternative: Parse "claude whoami" output
    // Logged in as: le.s@example.com
    const whoamiMatch = output.match(/Logged in as:\s+(.+)/);
    if (whoamiMatch) {
      setClaudeInfo(prev => ({ ...prev, loggedIn: true }));
    }
  }, [isAuthenticating, authStep]); // Add dependencies for authentication flow

  // No automatic check on terminal show - the script runs automatically via terminal:ready event

  const checkClaudeStatus = () => {
    console.log('🔍 Manual check Claude status triggered');
    setClaudeInfo(prev => ({ ...prev, checking: true }));

    // Run the check script
    const command = 'node /volume1/Docker_data/claude-manager-test/check-claude-logged-in.js';
    console.log('📤 Sending check command:', command);
    socket.emit('terminal:input', command + '\r');

    // Stop checking spinner after 3 seconds (markers should have been detected by then)
    setTimeout(() => {
      setClaudeInfo(prev => ({ ...prev, checking: false }));
    }, 3000);
  };

  const handleConnectClaude = () => {
    setClaudeConnecting(true);
    setClaudeStatus('Lancement de Claude...');

    // Send command to terminal to run claude
    socket.emit('terminal:input', 'claude\r');

    setTimeout(() => {
      setClaudeConnecting(false);
      setClaudeStatus('Claude lancé dans le terminal');
      setTimeout(() => setClaudeStatus(null), 3000);
    }, 1500);
  };

  const handleClaudeAuth = () => {
    console.log('🔐 Starting Claude authentication...');
    setIsAuthenticating(true);
    setAuthStep(null);
    setEnterSent(false); // Reset enter sent flag
    setOauthUrl(null); // Reset OAuth URL
    setClaudeStatus('Lancement de Claude pour authentification...');

    // Just launch claude (not "claude auth")
    socket.emit('terminal:input', 'claude\r');
  };

  const handleInstallClaude = () => {
    socket.emit('terminal:input', 'npm install -g @anthropic-ai/claude-code\r');
    setClaudeStatus('Installation de Claude en cours...');
    setTimeout(() => {
      setClaudeStatus('Vérifiez le terminal pour le statut d\'installation');
      setTimeout(() => {
        setClaudeStatus(null);
        checkClaudeStatus();
      }, 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal et élégant */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Claude Manager</h1>
              <p className="text-xs text-gray-500">Terminal Web · Claude Code Control</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">{user?.username}</span>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!showTerminal && (
        <div className="max-w-7xl mx-auto px-6 py-20 animate-fade-in">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-medium text-gray-900">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Nouvelle expérience de développement
            </div>

            <h2 className="text-6xl font-bold text-gray-900 tracking-tight">
              Développez avec
              <span className="block text-yellow-400 mt-2">Claude Code</span>
            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Un terminal intelligent qui comprend vos intentions.
              Codez, déployez et gérez vos projets avec l'assistance de l'IA.
            </p>

            <div className="flex items-center justify-center gap-4 pt-8">
              <Button
                size="lg"
                className="gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => setShowTerminal(true)}
              >
                <Play className="w-5 h-5" />
                Lancer le terminal
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8 py-6 text-lg"
              >
                <Code2 className="w-5 h-5" />
                Documentation
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            <Card className="p-8 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all animate-slide-in">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ultra rapide</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Exécutez vos commandes instantanément avec une latence minimale et une connexion WebSocket optimisée.
              </p>
            </Card>

            <Card className="p-8 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all animate-slide-in" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">IA intégrée</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Claude Code vous assiste dans votre développement avec des suggestions contextuelles intelligentes.
              </p>
            </Card>

            <Card className="p-8 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all animate-slide-in" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions persistantes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vos sessions sont sauvegardées automatiquement. Reprenez votre travail exactement où vous l'avez laissé.
              </p>
            </Card>
          </div>

          {/* Code Example */}
          <Card className="mt-24 p-8 bg-gray-900 border-gray-800 overflow-hidden animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-400 ml-4">terminal</span>
            </div>
            <pre className="text-sm leading-relaxed">
              <code className="text-gray-300">
                <span className="text-green-400">$</span> <span className="text-white">npm install</span>{'\n'}
                <span className="text-gray-500">✓ Dependencies installed successfully</span>{'\n'}
                {'\n'}
                <span className="text-green-400">$</span> <span className="text-white">npm run dev</span>{'\n'}
                <span className="text-blue-400">  VITE v5.0.0</span> <span className="text-gray-500">ready in 234 ms</span>{'\n'}
                {'\n'}
                <span className="text-gray-500">  ➜  Local:   </span><span className="text-cyan-400">http://localhost:5173/</span>{'\n'}
                <span className="text-gray-500">  ➜  Network: </span><span className="text-cyan-400">http://192.168.1.10:5173/</span>
              </code>
            </pre>
          </Card>
        </div>
      )}

      {/* Terminal View */}
      {showTerminal && (
        <div className="h-[calc(100vh-73px)] p-6 animate-fade-in">
          <div className="h-full max-w-7xl mx-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Terminal Session</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTerminal(false)}
              >
                Retour à l'accueil
              </Button>
            </div>

            {/* Terminal Card */}
            <Card className="flex-1 overflow-hidden border-gray-800 terminal-container mb-4">
              <Terminal onTerminalOutput={handleTerminalOutput} />
            </Card>

            {/* Profile Selector - Collapsible */}
            <Card className="mb-4 border-gray-200 bg-white">
              <div className="p-4">
                <button
                  onClick={() => setShowProfiles(!showProfiles)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Profils Claude</h4>
                      <p className="text-sm text-gray-600">
                        Gérer vos comptes Claude (multi-profils)
                      </p>
                    </div>
                  </div>
                  <div className={`transform transition-transform ${showProfiles ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>
              {showProfiles && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-200">
                  <div className="mt-4">
                    <ProfileSelector socket={socket} />
                  </div>
                </div>
              )}
            </Card>

            {/* Claude Code Control Panel */}
            <Card className="p-4 border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      Claude Assistant
                      {claudeInfo.checking && (
                        <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      {claudeInfo.installed === false && !claudeInfo.checking && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {claudeInfo.loggedIn === true && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {claudeInfo.installed === true && claudeInfo.loggedIn === false && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {claudeStatus || (() => {
                        if (claudeInfo.checking) return "Vérification du statut...";
                        if (claudeInfo.installed === false) return "Claude n'est pas installé";
                        if (claudeInfo.loggedIn === false) return "Claude installé mais non authentifié";
                        if (claudeInfo.loggedIn === true && claudeInfo.username) {
                          return `Connecté en tant que ${claudeInfo.username}${claudeInfo.plan ? ` • ${claudeInfo.plan}` : ''}${claudeInfo.model ? ` • ${claudeInfo.model}` : ''}`;
                        }
                        return "Lancez Claude pour l'assistance IA";
                      })()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Show buttons only after initial check is done */}
                  {claudeInfo.initialCheckDone && (
                    <>
                      {claudeInfo.installed === false && (
                        <Button
                          onClick={handleInstallClaude}
                          disabled={claudeConnecting}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Installer Claude
                        </Button>
                      )}

                      {claudeInfo.installed === true && claudeInfo.loggedIn === false && (
                        <Button
                          onClick={handleClaudeAuth}
                          disabled={claudeConnecting}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-2"
                        >
                          <User className="w-4 h-4" />
                          Authentifier
                        </Button>
                      )}

                      {claudeInfo.loggedIn === true && (
                        <Button
                          onClick={handleConnectClaude}
                          disabled={claudeConnecting}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold gap-2"
                        >
                          {claudeConnecting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                              Connexion...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Lancer Claude
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                  {/* Vérifier button - always visible */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkClaudeStatus}
                    disabled={claudeInfo.checking}
                    className="gap-2"
                  >
                    {claudeInfo.checking ? (
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Code2 className="w-4 h-4" />
                    )}
                    Vérifier
                  </Button>

                  {/* Show loading state during initial check */}
                  {!claudeInfo.initialCheckDone && claudeInfo.checking && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      Vérification en cours...
                    </div>
                  )}
                </div>
              </div>

              {/* OAuth Link Display - Show when authentication is in progress and URL is detected */}
              {oauthUrl && authStep === 'oauth' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Lien d'authentification Claude
                    </p>
                    <div className="bg-white border border-blue-300 rounded px-3 py-2 mb-2 font-mono text-xs break-all text-blue-800 max-h-20 overflow-y-auto">
                      {oauthUrl}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Fallback copy method for when clipboard API is not available
                          const copyToClipboard = (text) => {
                            // Method 1: Try modern clipboard API
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              return navigator.clipboard.writeText(text);
                            }

                            // Method 2: Fallback using textarea (works everywhere)
                            return new Promise((resolve, reject) => {
                              const textarea = document.createElement('textarea');
                              textarea.value = text;
                              textarea.style.position = 'fixed';
                              textarea.style.opacity = '0';
                              document.body.appendChild(textarea);
                              textarea.focus();
                              textarea.select();

                              try {
                                const successful = document.execCommand('copy');
                                document.body.removeChild(textarea);

                                if (successful) {
                                  resolve();
                                } else {
                                  reject(new Error('Copy command failed'));
                                }
                              } catch (err) {
                                document.body.removeChild(textarea);
                                reject(err);
                              }
                            });
                          };

                          copyToClipboard(oauthUrl)
                            .then(() => {
                              setClaudeStatus('✅ Lien copié dans le presse-papier !');
                              setTimeout(() => setClaudeStatus(null), 3000);
                            })
                            .catch((err) => {
                              console.error('Copy failed:', err);
                              setClaudeStatus('❌ Erreur de copie. Sélectionnez et copiez manuellement le lien ci-dessus.');
                              setTimeout(() => setClaudeStatus(null), 5000);
                            });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copier le lien
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(oauthUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ouvrir dans un nouvel onglet
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      💡 Après vous être authentifié dans le navigateur, collez le code dans le terminal ci-dessus.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Actions rapides :</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => socket.emit('terminal:input', 'clear\r')}
                    className="text-xs"
                  >
                    Effacer terminal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => socket.emit('terminal:input', 'ls -la\r')}
                    className="text-xs"
                  >
                    Liste fichiers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => socket.emit('terminal:input', 'git status\r')}
                    className="text-xs"
                  >
                    Git status
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
