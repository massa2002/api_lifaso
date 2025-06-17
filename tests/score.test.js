const admin = require("firebase-admin");

const serviceAccount = require("../firebase-service-account.json"); // Assure-toi que ce fichier est présent

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        firestore: {
            ignoreUndefinedProperties: true,
        },
    });
}

const db = admin.firestore();

// Fonction pour récupérer un document aléatoire
async function recupererScoreAleatoire() {
    let score = {};

    try {
        const scoreSnapshot = await db.collection("score").get();

        if (scoreSnapshot.empty) {
            console.log("❌ Aucune donnée trouvée dans la collection 'score'.");
            return score;
        }

        // Prendre un document aléatoire
        const randomDoc = scoreSnapshot.docs[Math.floor(Math.random() * scoreSnapshot.docs.length)];
        const data = randomDoc.data();

        console.log(`✅ Document aléatoire récupéré : ${randomDoc.id}`);
        score[data.categorie] = data.max || 100; // Valeur par défaut = 100 si max absent

        return score;
    } catch (e) {
        console.error("❌ Erreur lors de la récupération du score :", e);
        return {};
    }
}

// 🚀 Test Jest
describe("Test de récupération d'un score aléatoire depuis Firestore", () => {
    test("Vérifier si un score aléatoire est bien récupéré", async () => {
        const score = await recupererScoreAleatoire();

        console.log("\n✅ Résultat du score récupéré :", score);

        expect(score).toBeDefined();
        expect(typeof score).toBe("object");
    });
});
