#!/usr/bin/env node

/**
 * Script de vérification de connexion à l'API Claude (Anthropic)
 *
 * Ce script teste:
 * - La validité de la clé API
 * - La connexion à l'API Anthropic
 * - Les permissions du compte
 * - Les informations de limite de taux
 *
 * Usage: node check-claude-connection.js
 * Ou avec une clé API spécifique: ANTHROPIC_API_KEY=sk-xxx node check-claude-connection.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

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

// Charger la clé API depuis .env si disponible
function loadApiKey() {
  // 1. Essayer la variable d'environnement
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // 2. Essayer de lire depuis backend/.env
  const envPaths = [
    path.join(__dirname, 'backend', '.env'),
    path.join(__dirname, '.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
      if (match && match[1]) {
        log(`✓ Clé API trouvée dans ${envPath}`, 'green');
        return match[1].trim();
      }
    }
  }

  return null;
}

// Faire une requête HTTPS
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// Test 1: Vérifier la validité de la clé API avec une requête minimale
async function testApiKey(apiKey) {
  logSection('Test 1: Validation de la clé API');

  const postData = JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: 'Hi',
      },
    ],
  });

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  try {
    const response = await makeRequest(options, postData);

    log(`Status: ${response.statusCode}`, response.statusCode === 200 ? 'green' : 'red');

    // Afficher les headers de rate limit
    if (response.headers['anthropic-ratelimit-requests-limit']) {
      log('\nLimites de taux:', 'cyan');
      log(`  Requêtes limite: ${response.headers['anthropic-ratelimit-requests-limit']}`);
      log(`  Requêtes restantes: ${response.headers['anthropic-ratelimit-requests-remaining']}`);
      log(`  Requêtes reset: ${response.headers['anthropic-ratelimit-requests-reset']}`);
      log(`  Tokens limite: ${response.headers['anthropic-ratelimit-tokens-limit']}`);
      log(`  Tokens restants: ${response.headers['anthropic-ratelimit-tokens-remaining']}`);
      log(`  Tokens reset: ${response.headers['anthropic-ratelimit-tokens-reset']}`);
    }

    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      log('\n✓ Clé API valide et fonctionnelle!', 'green');
      log(`Modèle utilisé: ${body.model}`, 'blue');
      log(`ID de la requête: ${body.id}`, 'blue');
      return true;
    } else {
      log('\n✗ Erreur avec la clé API', 'red');
      try {
        const errorBody = JSON.parse(response.body);
        log(`Type d'erreur: ${errorBody.error?.type}`, 'yellow');
        log(`Message: ${errorBody.error?.message}`, 'yellow');
      } catch (e) {
        log(`Réponse brute: ${response.body}`, 'yellow');
      }
      return false;
    }
  } catch (error) {
    log(`✗ Erreur de connexion: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Vérifier la connexion réseau à l'API
async function testNetworkConnection() {
  logSection('Test 2: Connexion réseau à api.anthropic.com');

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/',
    method: 'GET',
  };

  try {
    const response = await makeRequest(options);
    log(`✓ Connexion réseau établie (Status: ${response.statusCode})`, 'green');
    return true;
  } catch (error) {
    log(`✗ Impossible de se connecter à api.anthropic.com`, 'red');
    log(`Erreur: ${error.message}`, 'yellow');
    return false;
  }
}

// Afficher des informations sur l'environnement
function displayEnvironmentInfo() {
  logSection('Informations sur l\'environnement');

  log(`Node.js version: ${process.version}`, 'blue');
  log(`Plateforme: ${process.platform}`, 'blue');
  log(`Architecture: ${process.arch}`, 'blue');
  log(`Répertoire de travail: ${process.cwd()}`, 'blue');

  // Vérifier si on est dans Docker
  if (fs.existsSync('/.dockerenv')) {
    log('Environnement: Docker', 'cyan');
  } else {
    log('Environnement: Natif', 'cyan');
  }
}

// Programme principal
async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════╗', 'bright');
  log('║   Vérification de connexion à l\'API Claude (Anthropic) ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝', 'bright');

  displayEnvironmentInfo();

  // Charger la clé API
  logSection('Chargement de la clé API');
  const apiKey = loadApiKey();

  if (!apiKey) {
    log('✗ Aucune clé API trouvée!', 'red');
    log('\nVeuillez définir ANTHROPIC_API_KEY:', 'yellow');
    log('  1. Via variable d\'environnement: export ANTHROPIC_API_KEY=sk-xxx', 'yellow');
    log('  2. Ou dans un fichier .env (backend/.env ou .env)', 'yellow');
    process.exit(1);
  }

  // Masquer partiellement la clé pour la sécurité
  const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  log(`Clé API trouvée: ${maskedKey}`, 'green');

  // Exécuter les tests
  const networkOk = await testNetworkConnection();
  if (!networkOk) {
    log('\n⚠ Vérifiez votre connexion Internet et vos paramètres réseau', 'yellow');
    process.exit(1);
  }

  const apiKeyOk = await testApiKey(apiKey);

  // Résumé final
  logSection('Résumé');
  log(`Connexion réseau: ${networkOk ? '✓ OK' : '✗ ÉCHEC'}`, networkOk ? 'green' : 'red');
  log(`Clé API: ${apiKeyOk ? '✓ Valide' : '✗ Invalide'}`, apiKeyOk ? 'green' : 'red');

  if (networkOk && apiKeyOk) {
    log('\n🎉 Tout fonctionne correctement!', 'green');
    log('Vous pouvez utiliser l\'API Claude sans problème.', 'green');
    process.exit(0);
  } else {
    log('\n❌ Des problèmes ont été détectés', 'red');
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  log(`\n✗ Erreur non gérée: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Exécuter le script
main();
