require("dotenv").config();
const mongoose = require("mongoose");

const dbDiagnostic = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`🔌 Tentando conectar ao MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ":****@")}`);
    
    await mongoose.connect(mongoUri);
    console.log("✅ Conexão estabelecida com sucesso!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📂 Coleções encontradas:", collections.map(c => c.name).join(", "));

    // Acessa a coleção de plantas (ajustada para o plural padrão do mongoose ou explícita)
    const plantsCollection = db.collection("plants");
    const count = await plantsCollection.countDocuments();
    console.log(`📊 Total de documentos na coleção 'plants': ${count}`);

    if (count > 0) {
      const uniqueUserIds = await plantsCollection.distinct("userId");
      console.log(`👤 UserIDs proprietários dos itens:`, uniqueUserIds);
      
      const firstItems = await plantsCollection.find({}).limit(3).toArray();
      console.log(`📝 Amostra de nomes das plantas no banco:`, firstItems.map(p => p.nome).join(", "));
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no diagnóstico:", err.message);
    process.exit(1);
  }
};

dbDiagnostic();
