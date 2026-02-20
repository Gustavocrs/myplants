const express = require("express");
const multer = require("multer");
const {GoogleGenAI} = require("@google/genai");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

const apiKey = (
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  ""
).trim();
if (!apiKey) {
  console.error(
    "❌ ERRO CRÍTICO: GEMINI_API_KEY não encontrada nas variáveis de ambiente!",
  );
}

const ai = new GoogleGenAI({apiKey});

const MODEL_NAME = process.env.GEMINI_MODEL
  ? process.env.GEMINI_MODEL.trim()
  : "gemini-2.5-flash";

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

    const contents = [];

    if (file) {
      const base64Image = file.buffer.toString("base64");
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image,
        },
      });
    }

    if (prompt) {
      contents.push(prompt);
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
    });

    return res.json({
      success: true,
      response: response.text,
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
