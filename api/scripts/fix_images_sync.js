require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Plant = require("../models/Plant");

const fixSync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conectado ao MongoDB para reparo.");

        const uploadsDir = path.join(__dirname, "..", "public", "uploads");
        const files = fs.readdirSync(uploadsDir);
        console.log(`📂 Encontrados ${files.length} arquivos físicos na pasta uploads.`);

        const plants = await Plant.find({});
        console.log(`🔍 Analisando ${plants.length} plantas no banco.`);

        let corrected = 0;

        for (const plant of plants) {
            // Se a planta já tem imagemUrl mas ela não está carregando
            if (plant.imagemUrl) {
                const currentFileName = plant.imagemUrl.split("/").pop();
                
                // Verifica se o arquivo atual existe
                if (!files.includes(currentFileName)) {
                    console.log(`❌ Arquivo não encontrado: ${currentFileName} (Planta: ${plant.nome})`);
                    
                    // Tenta encontrar um arquivo que comece com uma data similar (os primeiros 5 dígitos do timestamp)
                    const prefix = currentFileName.substring(0, 5);
                    const matchingFile = files.find(f => f.startsWith(prefix) || f.includes(plant.nome.substring(0, 3)));

                    if (matchingFile) {
                        const baseUrl = process.env.API_URL ? process.env.API_URL.replace(/\/api\/?$/, "") : "";
                        const newUrl = `${baseUrl}/uploads/${matchingFile}`;
                        
                        console.log(`   ✅ Sincronizando com arquivo real: ${matchingFile}`);
                        plant.imagemUrl = newUrl;
                        await plant.save();
                        corrected++;
                    }
                }
            }
        }

        console.log(`\n🏁 Reparo concluído! ${corrected} plantas sincronizadas com arquivos reais.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Erro no reparo:", err.message);
        process.exit(1);
    }
};

fixSync();
