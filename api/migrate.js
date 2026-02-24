require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Plant = require("./models/Plant");

// Configuração de Arquivos Estáticos (Uploads)
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {recursive: true});
}

const saveBase64Image = (base64String) => {
  if (!base64String || !base64String.startsWith("data:image")) return null;

  try {
    const matches = base64String.match(
      /^data:image\/([a-zA-Z0-9]+);base64,(.+)$/,
    );
    if (!matches || matches.length !== 3) return null;

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const uploadPath = path.join(uploadsDir, fileName);

    fs.writeFileSync(uploadPath, buffer);

    // Usa a variável de ambiente ou fallback
    const apiUrl = process.env.API_URL || "http://localhost:3001/api";
    return `${apiUrl}/uploads/${fileName}`;
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    return null;
  }
};

const migrate = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não definida no .env");
    }

    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado!");

    const plants = await Plant.find({});
    console.log(`🔍 Analisando ${plants.length} plantas...`);

    let count = 0;
    for (const plant of plants) {
      if (plant.imagemUrl && plant.imagemUrl.startsWith("data:image")) {
        console.log(`🖼️  Migrando: ${plant.nome}...`);
        const newUrl = saveBase64Image(plant.imagemUrl);

        if (newUrl) {
          plant.imagemUrl = newUrl;
          await plant.save();
          count++;
          console.log(`   ✅ Sucesso: ${newUrl}`);
        }
      }
    }

    console.log(`\n🏁 Migração concluída! ${count} imagens convertidas.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
};

migrate();
