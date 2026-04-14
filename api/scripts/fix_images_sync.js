const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Plant = require("../models/Plant");

async function fixImages() {
  try {
    console.log("🚀 Iniciando otimização de imagens existentes...");

    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/myplants";
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado ao MongoDB");

    const uploadsDir = path.join(__dirname, "..", "public", "uploads");
    const files = fs.readdirSync(uploadsDir);

    console.log(`Found ${files.length} files in uploads directory.`);

    for (const file of files) {
      if (file.endsWith(".webp")) continue; // Pular se já for webp

      const filePath = path.join(uploadsDir, file);
      const ext = path.extname(file).toLowerCase();
      
      if (![".jpg", ".jpeg", ".png", ".heic"].includes(ext)) continue;

      const newFileName = `${path.parse(file).name}.webp`;
      const newPath = path.join(uploadsDir, newFileName);

      console.log(`Processing: ${file} -> ${newFileName}`);

      try {
        // Otimizar imagem
        await sharp(filePath)
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toFile(newPath);

        // Atualizar referências no banco de dados
        const oldUrlPart = `/uploads/${file}`;
        const newUrlPart = `/uploads/${newFileName}`;

        const result = await Plant.updateMany(
          { imagemUrl: { $regex: file } },
          [
            {
              $set: {
                imagemUrl: {
                  $replaceOne: {
                    input: "$imagemUrl",
                    find: file,
                    replacement: newFileName
                  }
                }
              }
            }
          ]
        );

        console.log(`   ✅ Optimized and updated ${result.modifiedCount} database records.`);

        // Remover arquivo antigo se a conversão foi bem sucedida
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`   ❌ Error processing ${file}:`, err.message);
      }
    }

    console.log("✨ Otimização concluída!");
    process.exit(0);
  } catch (err) {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
  }
}

fixImages();
