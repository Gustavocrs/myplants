const admin = require("firebase-admin");
const Plant = require("../models/Plant");
const Settings = require("../models/Settings");

/**
 * Serviço de Backup: MongoDB -> Firebase Firestore
 * Realiza uma sincronização semanal de segurança dos dados da VPS para o Google Cloud.
 */

// A inicialização do Firebase deve ser protegida para não ocorrer duplicidade
if (!admin.apps.length) {
  try {
    let saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!saRaw) throw new Error("A variável FIREBASE_SERVICE_ACCOUNT não está definida.");
    
    // Limpeza profunda da string para evitar erros de parse JSON na VPS
    saRaw = saRaw.trim();
    
    // Se a string começar/terminar com aspas extras (comum em shell), remove
    if (saRaw.startsWith("'") && saRaw.endsWith("'")) saRaw = saRaw.slice(1, -1);
    if (saRaw.startsWith('"') && saRaw.endsWith('"')) saRaw = saRaw.slice(1, -1);

    // Corrige quebras de linha literais que podem ter sido escapadas erroneamente
    let cleanSa = saRaw.replace(/\\n/g, '\n');
    
    // Auto-fix agressivo: Se o JSON estiver sem aspas (comum em erros de env/docker)
    // Ex: {type: service_account} -> {"type": "service_account"}
    if (cleanSa.startsWith('{') && (!cleanSa.includes('":') || !cleanSa.includes('": "'))) {
      // 1. Garante aspas nas chaves
      cleanSa = cleanSa.replace(/([{,])\s*([^"{,\s]+)\s*:/g, '$1"$2":');
      // 2. Garante aspas nos valores que não as têm (exceto números, booleans e nulos)
      cleanSa = cleanSa.replace(/:\s*([^"{,\s][^,}]*)/g, (match, value) => {
        const trimmed = value.trim();
        if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null' || !isNaN(trimmed)) return match;
        // Se já tiver aspas, não mexe
        if (trimmed.startsWith('"') || trimmed.startsWith("'")) return match;
        return `: "${trimmed}"`;
      });
    }

    const serviceAccount = JSON.parse(cleanSa);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ [BackupService] Firebase-Admin inicializado com sucesso.");
  } catch (error) {
    const preview = process.env.FIREBASE_SERVICE_ACCOUNT ? process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 20) + "..." : "null";
    console.error(`❌ [BackupService] Erro ao inicializar Firebase. Início da string: "${preview}". Erro:`, error.message);
  }
}

/**
 * Função principal que realiza o backup das coleções
 */
const backupMongoToFirebase = async () => {
  let db;
  try {
    db = admin.firestore();
  } catch (err) {
    console.error("❌ [BackupService] Não foi possível acessar o Firestore. Verifique as chaves do Firebase.");
    return;
  }

  console.log("📡 [BackupService] Iniciando sincronização semanal para o Firebase...");
  const stats = { plants: 0, settings: 0, errors: 0 };

  try {
    // 1. Backup de Plantas
    const plants = await Plant.find({});
    console.log(`📥 [BackupService] Processando ${plants.length} plantas...`);

    for (const plant of plants) {
      try {
        const plantObj = plant.toObject();
        const docId = plantObj._id.toString(); // Usa o ID do Mongo como referência estável

        // Mapeamento para o formato Firestore
        const firestoreData = {
          name: plantObj.nome,
          userId: plantObj.userId,
          intervaloRega: plantObj.intervaloRega,
          luz: plantObj.luz,
          petFriendly: plantObj.petFriendly,
          lembretesAtivos: plantObj.lembretesAtivos,
          imageUrl: plantObj.imagemUrl,
          lastWatered: plantObj.ultimaRega || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          source: "vps-backup"
        };

        await db.collection("plants_backup").doc(docId).set(firestoreData, { merge: true });
        stats.plants++;
      } catch (err) {
        console.error(`❌ Erro ao sincronizar planta ${plant.nome}:`, err.message);
        stats.errors++;
      }
    }

    // 2. Backup de Configurações do Usuário
    const userSettings = await Settings.find({});
    console.log(`📥 [BackupService] Processando ${userSettings.length} configurações...`);

    for (const config of userSettings) {
      try {
        const configObj = config.toObject();
        const docId = configObj.userId; // Usa o userId como ID único no Firebase

        const firestoreConfig = {
          ...configObj,
          _id: undefined, // Remove ID do Mongo para o Firebase
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          source: "vps-backup"
        };

        // Remove campos sensíveis criptografados se houver receio, 
        // mas aqui estamos mantendo para backup integral
        await db.collection("settings_backup").doc(docId).set(firestoreConfig, { merge: true });
        stats.settings++;
      } catch (err) {
        console.error(`❌ Erro ao sincronizar settings para user ${config.userId}:`, err.message);
        stats.errors++;
      }
    }

    console.log("✅ [BackupService] Sincronização concluída com sucesso!");
    console.log(`📊 Estatísticas: ${stats.plants} plantas, ${stats.settings} configs, ${stats.errors} erros.`);

  } catch (error) {
    console.error("❌ [BackupService] Erro crítico durante o backup:", error);
  }
};

module.exports = { backupMongoToFirebase };
