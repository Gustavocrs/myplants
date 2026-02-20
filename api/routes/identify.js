const express = require("express");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const router = express.Router();

// 🔹 Inicializa Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔹 Modelo configurável
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

router.post("/", async (req, res) => {
  try {
    console.log("🤖 Inicializando modelo:", MODEL_NAME);

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const {prompt, imageBase64} = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Envie um prompt ou imagemBase64.",
      });
    }

    // 🔹 Monta partes da requisição
    const parts = [];

    if (prompt) {
      parts.push({text: prompt});
    }

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // ajuste se for png
          data: imageBase64,
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
    const text = response.text();

    return res.json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error("❌ Erro ao consultar IA:", error);

    return res.status(500).json({
      success: false,
      error: "Erro ao consultar IA",
      details: error.message,
    });
  }
});

module.exports = router;
