const express = require("express");
const multer = require("multer");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

// Adicionando .trim() para evitar falhas por espaços em branco vindos do .env
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
if (!apiKey) {
  console.error(
    "❌ ERRO CRÍTICO: GEMINI_API_KEY não encontrada nas variáveis de ambiente!",
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

// Aplicando .trim() no nome do modelo e mantendo o fallback para o modelo flash
const MODEL_NAME = process.env.GEMINI_MODEL
  ? process.env.GEMINI_MODEL.trim()
  : "gemini-1.5-flash";

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {prompt} = req.body;
    const file = req.file;

    if (!prompt && !file) {
      return res.status(400).json({
        success: false,
        error: "Envie um prompt ou uma imagem.",
      });
    }

    console.log(`🤖 Consultando IA com modelo: '${MODEL_NAME}'`);
    const model = genAI.getGenerativeModel({model: MODEL_NAME});

    const parts = [];

    if (prompt) {
      parts.push({text: prompt});
    }

    if (file) {
      const base64Image = file.buffer.toString("base64");

      parts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image,
        },
      });
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    const response = await result.response;

    return res.json({
      success: true,
      response: response.text(),
    });
  } catch (error) {
    console.error("Erro Gemini:", error);

    return res.status(500).json({
      success: false,
      error: "Erro ao consultar IA",
      details: error.message,
    });
  }
});

module.exports = router;
