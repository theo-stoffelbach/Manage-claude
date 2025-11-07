import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Terminal from '../components/Terminal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Terminal as TerminalIcon, Zap, Code2, Sparkles, LogOut, User, Play, Clock, Bot, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

  // Listen to terminal output for Claude status
  useEffect(() => {
    const handleTerminalOutput = (data) => {
      const output = data.toString();

      // Check for installation status
      if (output.includes('CLAUDE_INSTALLED')) {
        setClaudeInfo(prev => ({ ...prev, installed: true, checking: false, initialCheckDone: true }));
      } else if (output.includes('CLAUDE_NOT_INSTALLED')) {
        setClaudeInfo(prev => ({ ...prev, installed: false, loggedIn: false, checking: false, initialCheckDone: true }));
      }

      // Check for login status
      if (output.includes('CLAUDE_NOT_LOGGED_IN')) {
        setClaudeInfo(prev => ({ ...prev, loggedIn: false, username: null, plan: null, model: null, checking: false, initialCheckDone: true }));
      }

      // Check for logged in status
      if (output.includes('CLAUDE_LOGGED_IN')) {
        setClaudeInfo(prev => ({ ...prev, loggedIn: true, checking: false, initialCheckDone: true }));
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
    };

    socket.on('terminal:output', handleTerminalOutput);

    return () => {
      socket.off('terminal:output', handleTerminalOutput);
    };
  }, []);

  // No automatic check on terminal show - the script runs automatically via terminal:ready event

  const checkClaudeStatus = () => {
    setClaudeInfo(prev => ({ ...prev, checking: true }));

    // Check if claude is installed
    socket.emit('terminal:input', 'which claude && echo "CLAUDE_INSTALLED" || echo "CLAUDE_NOT_INSTALLED"\r');

    // Wait a bit then check if logged in
    setTimeout(() => {
      socket.emit('terminal:input', 'claude whoami 2>/dev/null && echo "CLAUDE_LOGGED_IN" || echo "CLAUDE_NOT_LOGGED_IN"\r');

      setTimeout(() => {
        setClaudeInfo(prev => ({ ...prev, checking: false }));
      }, 2000);
    }, 1000);
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
    socket.emit('terminal:input', 'claude auth\r');
    setClaudeStatus('Commande d\'authentification envoyée au terminal');
    setTimeout(() => setClaudeStatus(null), 3000);
  };

  const handleInstallClaude = () => {
    socket.emit('terminal:input', 'npm install -g @anthropics/claude\r');
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
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-sm">
              <TerminalIcon className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Claude Terminal</h1>
              <p className="text-xs text-gray-500">Powered by AI</p>
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
              <Terminal />
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

                  {/* Vérifier button - hidden initially, shown after first check */}
                  {claudeInfo.initialCheckDone && (
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
                  )}

                  {/* Show loading state during initial check */}
                  {!claudeInfo.initialCheckDone && claudeInfo.checking && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      Vérification en cours...
                    </div>
                  )}
                </div>
              </div>

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
