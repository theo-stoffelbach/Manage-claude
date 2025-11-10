// check-claude.js
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

// Le SDK va automatiquement chercher la clé dans process.env.ANTHROPIC_API_KEY
const anthropic = new Anthropic();

async function checkConnection() {
  console.log("Vérification de la connexion à l'API Claude...");

  if (!anthropic.apiKey) {
    console.error("ERREUR : Clé API Anthropic (ANTHROPIC_API_KEY) non trouvée.");
    console.log("Vérifiez votre fichier .env");
    return;
  }

  try {
    // On fait l'appel le plus petit et le moins cher possible
    const testMsg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Le modèle le plus rapide/léger
      max_tokens: 1,
      messages: [{ role: "user", content: "Test" }],
    });

    console.log("\n✅ SUCCÈS !");
    console.log("Connexion à l'API Claude réussie.");
    console.log("Modèle utilisé :", testMsg.model);

  } catch (error) {
    console.error("\n❌ ÉCHEC DE LA CONNEXION !");

    // Gérer les erreurs spécifiques
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Erreur d'authentification : Votre clé API est invalide ou révoquée.");
    } else if (error instanceof Anthropic.PermissionError) {
      console.error("Erreur de permission : Vous n'avez pas accès au modèle demandé.");
    } else {
      console.error("Erreur inattendue :", error.message);
    }
  }
}

checkConnection();
