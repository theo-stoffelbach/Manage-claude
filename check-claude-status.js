#!/usr/bin/env node

/**
 * Script de vérification du statut de Claude Code (sans démarrer Claude)
 *
 * Ce script vérifie:
 * - Si Claude Code est en cours d'exécution
 * - Si le serveur local de Claude est accessible
 * - Les processus Claude actifs
 *
 * Usage: node check-claude-status.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const net = require('net');

const execAsync = promisify(exec);

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// Vérifier si un port est ouvert
function checkPort(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 2000;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// Chercher les processus Claude
async function findClaudeProcesses() {
  logSection('Recherche des processus Claude Code');

  try {
    // Chercher les processus contenant "claude"
    const { stdout } = await execAsync('ps aux | grep -i claude | grep -v grep');
    const processes = stdout.trim().split('\n').filter(line => line.length > 0);

    if (processes.length > 0) {
      log(`✓ ${processes.length} processus Claude trouvé(s)`, 'green');
      processes.forEach((proc, index) => {
        const parts = proc.split(/\s+/);
        const pid = parts[1];
        const cpu = parts[2];
        const mem = parts[3];
        const command = parts.slice(10).join(' ').substring(0, 80);

        log(`\n  Processus ${index + 1}:`, 'cyan');
        log(`    PID: ${pid}`);
        log(`    CPU: ${cpu}%`);
        log(`    MEM: ${mem}%`);
        log(`    CMD: ${command}`);
      });
      return processes;
    } else {
      log('✗ Aucun processus Claude Code trouvé', 'red');
      return [];
    }
  } catch (error) {
    log('✗ Aucun processus Claude Code trouvé', 'red');
    return [];
  }
}

// Vérifier si le CLI Claude est installé
async function checkClaudeCLI() {
  logSection('Vérification de l\'installation de Claude CLI');

  try {
    const { stdout } = await execAsync('which claude 2>/dev/null || echo ""');
    if (stdout.trim()) {
      log(`✓ Claude CLI trouvé: ${stdout.trim()}`, 'green');

      // Essayer d'obtenir la version
      try {
        const { stdout: version } = await execAsync('claude --version 2>&1');
        log(`  Version: ${version.trim()}`, 'blue');
      } catch (e) {
        // Version non disponible
      }

      return true;
    } else {
      log('✗ Claude CLI non trouvé dans le PATH', 'yellow');
      log('  Vous pouvez l\'installer depuis: https://docs.anthropic.com/claude/docs/claude-cli', 'yellow');
      return false;
    }
  } catch (error) {
    log('✗ Claude CLI non trouvé', 'yellow');
    return false;
  }
}

// Vérifier les ports communs utilisés par Claude Code
async function checkClaudePorts() {
  logSection('Vérification des ports Claude Code');

  const portsToCheck = [
    { port: 3000, name: 'Claude Code Server (default)' },
    { port: 3001, name: 'Claude Code Server (alt)' },
    { port: 8080, name: 'Claude Code WebSocket' },
    { port: 8081, name: 'Claude Code WebSocket (alt)' },
  ];

  let foundPorts = [];

  for (const { port, name } of portsToCheck) {
    const isOpen = await checkPort(port);
    if (isOpen) {
      log(`✓ Port ${port} ouvert (${name})`, 'green');
      foundPorts.push(port);
    } else {
      log(`✗ Port ${port} fermé (${name})`, 'red');
    }
  }

  return foundPorts;
}

// Vérifier les variables d'environnement liées à Claude
function checkClaudeEnvVars() {
  logSection('Variables d\'environnement Claude');

  const envVars = [
    'ANTHROPIC_API_KEY',
    'CLAUDE_API_KEY',
    'ANTHROPIC_BASE_URL',
  ];

  let found = false;

  for (const envVar of envVars) {
    if (process.env[envVar]) {
      const value = process.env[envVar];
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      log(`✓ ${envVar}: ${masked}`, 'green');
      found = true;
    } else {
      log(`✗ ${envVar}: non défini`, 'yellow');
    }
  }

  if (!found) {
    log('\n⚠ Aucune variable d\'environnement Claude trouvée', 'yellow');
  }

  return found;
}

// Vérifier les fichiers de configuration Claude
async function checkClaudeConfig() {
  logSection('Fichiers de configuration Claude');

  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  const configPaths = [
    path.join(os.homedir(), '.config', 'claude'),
    path.join(os.homedir(), '.claude'),
    path.join(os.homedir(), '.anthropic'),
  ];

  let foundConfig = false;

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      log(`✓ Configuration trouvée: ${configPath}`, 'green');

      // Lister les fichiers dans le répertoire
      try {
        const files = fs.readdirSync(configPath);
        if (files.length > 0) {
          log(`  Fichiers:`, 'cyan');
          files.forEach(file => {
            log(`    - ${file}`, 'blue');
          });
        }
      } catch (e) {
        // Erreur de lecture
      }

      foundConfig = true;
    } else {
      log(`✗ ${configPath} non trouvé`, 'yellow');
    }
  }

  return foundConfig;
}

// Programme principal
async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════╗', 'bright');
  log('║     Vérification du statut de Claude Code (local)     ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');

  log(`\nDate: ${new Date().toLocaleString()}`, 'blue');
  log(`Host: ${require('os').hostname()}`, 'blue');
  log(`User: ${require('os').userInfo().username}`, 'blue');

  // Exécuter toutes les vérifications
  const processes = await findClaudeProcesses();
  const cliInstalled = await checkClaudeCLI();
  const openPorts = await checkClaudePorts();
  const hasEnvVars = checkClaudeEnvVars();
  const hasConfig = await checkClaudeConfig();

  // Résumé
  logSection('Résumé du statut');

  const isRunning = processes.length > 0 || openPorts.length > 0;

  if (isRunning) {
    log('✓ Claude Code semble être EN COURS D\'EXÉCUTION', 'green');
    log(`  - ${processes.length} processus actif(s)`, 'cyan');
    log(`  - ${openPorts.length} port(s) ouvert(s)`, 'cyan');
  } else {
    log('✗ Claude Code ne semble PAS être en cours d\'exécution', 'red');
  }

  log(`\nCLI installé: ${cliInstalled ? '✓ Oui' : '✗ Non'}`, cliInstalled ? 'green' : 'yellow');
  log(`Variables d'env: ${hasEnvVars ? '✓ Oui' : '✗ Non'}`, hasEnvVars ? 'green' : 'yellow');
  log(`Configuration: ${hasConfig ? '✓ Oui' : '✗ Non'}`, hasConfig ? 'green' : 'yellow');

  // Recommandations
  if (!isRunning) {
    logSection('Recommandations');
    log('Pour démarrer Claude Code:', 'cyan');
    log('  1. Ouvrez votre terminal', 'blue');
    log('  2. Lancez: claude code', 'blue');
    log('  3. Ou utilisez votre IDE avec l\'extension Claude Code', 'blue');
  }

  process.exit(isRunning ? 0 : 1);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  log(`\n✗ Erreur: ${error.message}`, 'red');
  process.exit(1);
});

// Exécuter
main();
