const path = require("path");
require("dotenv").config();
const admin = require("firebase-admin");
const mongoose = require("mongoose");
const fs = require("fs");

const Plant = require("../models/Plant");

// Inicialização será feita dentro da função migrate

async function convertBase64ToFile(base64String) {
  if (!base64String || !base64String.startsWith("data:image")) {
    return base64String;
  }

  try {
    const matches = base64String.match(
      /^data:image\/([a-zA-Z0-9]+);base64,(.+)$/,
    );
    if (!matches) return base64String;

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const uploadsDir = path.join(__dirname, "..", "public", "uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const baseUrl = process.env.API_URL
      ? process.env.API_URL.replace(/\/api\/?$/, "")
      : "https://myplants-api.systechdev.com.br";

    return `${baseUrl}/uploads/${fileName}`;
  } catch (error) {
    console.error("Erro ao converter base64 para arquivo:", error.message);
    return base64String;
  }
}

async function migrate() {
  try {
    let saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!saRaw) throw new Error("A variável FIREBASE_SERVICE_ACCOUNT não está definida.");
    
    saRaw = saRaw.trim();
    if (saRaw.startsWith("'") && saRaw.endsWith("'")) saRaw = saRaw.slice(1, -1);
    
    const serviceAccount = JSON.parse(saRaw);

    console.log("🔌 Conectando no Firebase...");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    const firestore = admin.firestore();
    console.log("✅ Firebase conectado!");

    console.log("🔌 Conectando no MongoDB...");
    const mongoUri = process.env.MONGO_URI;

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB conectado!");

    console.log("📥 Buscando plantas do Firebase...");
    const snapshot = await firestore.collection("plants").get();
    console.log(`📊 Encontradas ${snapshot.size} plantas no Firebase`);

    let migrated = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userId = data.userId;

      if (!userId) {
        console.log(`⚠️ Pulando documento ${doc.id} - sem userId`);
        skipped++;
        continue;
      }

      const existing = await Plant.findOne({ userId, nome: data.name });
      
      let imagemUrl = data.imageUrl;
      if (imagemUrl && imagemUrl.startsWith("data:image")) {
        console.log(`🖼️  Convertendo imagem para ${data.name}...`);
        imagemUrl = await convertBase64ToFile(imagemUrl);
      }

      const plantData = {
        nome: data.name || "Sem nome",
        userId: userId,
        intervaloRega: 7,
        luz: "Meia-sombra",
        petFriendly: false,
        lembretesAtivos: true,
        imagemUrl: imagemUrl || "",
        createdAt: (data.createdAt && data.createdAt.toDate) ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
      };

      if (isNaN(plantData.createdAt.getTime())) {
        plantData.createdAt = new Date();
      }

      if (existing) {
        console.log(`🔄 Atualizando: ${data.name}...`);
        await Plant.findByIdAndUpdate(existing._id, plantData);
      } else {
        await Plant.create(plantData);
        console.log(`✅ Criado: ${plantData.nome} (userId: ${userId})`);
      }
      migrated++;
    }


    console.log("\n📈 RESUMO DA MIGRAÇÃO:");
    console.log(`   - Total processado: ${snapshot.size}`);
    console.log(`   - Migradas: ${migrated}`);
    console.log(`   - Puladas (duplicadas/sem userId): ${skipped}`);
    console.log("\n🎉 Migração concluída!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    process.exit(1);
  }
}

migrate();
