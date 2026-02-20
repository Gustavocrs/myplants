const express = require("express");
const multer = require("multer");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

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
