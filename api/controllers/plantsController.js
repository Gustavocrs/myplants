const Plant = require("../models/Plant");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Limite de 10MB em bytes
const MAX_STORAGE_BYTES = 10 * 1024 * 1024;

async function convertHeicToJpeg(base64String) {
  const matches = base64String.match(
    /^data:image\/([a-zA-Z0-9]+);base64,(.+)$/,
  );
  if (!matches) return base64String;

  const ext = matches[1].toLowerCase();
  if (ext !== "heic" && ext !== "heif") return base64String;

  const buffer = Buffer.from(matches[2], "base64");
  const jpegBuffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();

  return `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
}

// Função auxiliar para verificar uso de armazenamento
const checkStorageLimit = async (userId, newDocumentSize = 0) => {
  const stats = await Plant.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalSize: { $sum: { $bsonSize: "$$ROOT" } },
      },
    },
  ]);

  const currentSize = stats.length > 0 ? stats[0].totalSize : 0;
  return currentSize + newDocumentSize <= MAX_STORAGE_BYTES;
};

// Função auxiliar para salvar Base64 como arquivo com otimização
const saveBase64Image = async (base64String) => {
  if (!base64String || !base64String.startsWith("data:image"))
    return base64String;

  try {
    const matches = base64String.match(
      /^data:image\/([a-zA-Z0-9]+);base64,(.+)$/,
    );
    if (!matches || matches.length !== 3) return base64String;

    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Otimização com Sharp: Corrige orientação + Redimensionar + converter para WebP
    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const uploadPath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      fileName,
    );

    // Garante que o diretório existe
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    console.log(`💾 [Controller] Salvando imagem otimizada em: ${uploadPath}`);
    fs.writeFileSync(uploadPath, optimizedBuffer);

    const baseUrl = process.env.API_URL
      ? process.env.API_URL.replace(/\/api\/?$/, "")
      : "";
    return `${baseUrl}/uploads/${fileName}`;
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    return base64String;
  }
};

exports.getAllPlants = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    // Filtrar documentos inválidos que não têm nome ou userId (proteção contra dado corrupto/invasor)
    filter.nome = { $exists: true, $ne: "" };
    if (userId) filter.userId = userId;

    const plants = await Plant.find(filter)
      .collation({ locale: "pt", strength: 1 })
      .sort({ nome: 1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const plant = await Plant.findById(id);
    if (!plant) {
      return res.status(404).json({ error: "Planta não encontrada" });
    }
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPlant = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validação Básica
    if (!req.body.nome || !req.body.userId) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: nome e userId" });
    }

    // Estima o tamanho do novo documento (aproximação baseada no JSON)
    const docSize = Buffer.byteLength(JSON.stringify(req.body));

    // Otimização: Salva imagem em disco antes de verificar cota do banco
    if (req.body.imagemUrl) {
      req.body.imagemUrl = await convertHeicToJpeg(req.body.imagemUrl);
      req.body.imagemUrl = await saveBase64Image(req.body.imagemUrl);
    }

    const newPlant = new Plant(req.body);
    const savedPlant = await newPlant.save();
    res.status(201).json(savedPlant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ error: "Planta não encontrada" });

    // Se estiver trocando a imagem (que é pesada), verifica o limite
    if (req.body.imagemUrl && req.body.imagemUrl !== plant.imagemUrl) {
      // Converte nova imagem base64 para arquivo
      req.body.imagemUrl = await convertHeicToJpeg(req.body.imagemUrl);
      req.body.imagemUrl = await saveBase64Image(req.body.imagemUrl);
    }

    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedPlant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.batchUpdate = async (req, res) => {
  try {
    const { userId, updates } = req.body;
    if (!userId || !updates) {
      return res
        .status(400)
        .json({ error: "UserId e updates são obrigatórios" });
    }

    // Filtra apenas campos permitidos para atualização em massa
    const allowedUpdates = [
      "lembretesAtivos",
      "petFriendly",
      "luz",
      "intervaloRega",
    ];
    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await Plant.updateMany({ userId }, { $set: filteredUpdates });
    res.json({ success: true, message: "Plantas atualizadas com sucesso." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlant = async (req, res) => {
  try {
    // 1. Busca a planta antes de deletar para conseguir o nome da imagem
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ error: "Planta não encontrada" });

    // 2. Remove a imagem do disco se for local (evita lixo no servidor)
    if (plant.imagemUrl && plant.imagemUrl.includes("/uploads/")) {
      try {
        const fileName = plant.imagemUrl.split("/").pop();
        const filePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          fileName,
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Erro ao limpar imagem do disco:", e);
      }
    }

    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Planta removida com sucesso" });
  } catch (err) {
    console.error("Erro fatal ao excluir planta:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.confirmWatering = async (req, res) => {
  // Lógica simplificada de confirmação de rega
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);
    if (!plant) return res.status(404).json({ error: "Planta não encontrada" });
    
    plant.ultimaRega = new Date();
    await plant.save();
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStorageUsage = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserId obrigatório" });

    // Executa a agregação para calcular o tamanho real no banco
    const stats = await Plant.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: { $bsonSize: "$$ROOT" } },
        },
      },
    ]);

    const totalSize = stats.length > 0 ? stats[0].totalSize : 0;
    const sizeMB = totalSize / (1024 * 1024);

    // Retorna em MB
    res.json({ sizeMB });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
