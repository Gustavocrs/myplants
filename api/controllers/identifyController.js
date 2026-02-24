const {GoogleGenAI, Type} = require("@google/genai");
const Settings = require("../models/Settings");
const {decrypt} = require("../utils/crypto");

const MODEL_NAME = process.env.GEMINI_MODEL
  ? process.env.GEMINI_MODEL.trim()
  : "gemini-2.5-flash";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    nome: {type: Type.STRING},
    nomeCientifico: {type: Type.STRING},
    luz: {type: Type.STRING},
    intervaloRega: {type: Type.INTEGER},
    petFriendly: {type: Type.BOOLEAN},
    observacoes: {type: Type.STRING},
  },
  required: [
    "nome",
    "nomeCientifico",
    "luz",
    "intervaloRega",
    "petFriendly",
    "observacoes",
  ],
};

exports.identifyPlant = async (req, res) => {
  try {
    const file = req.file;
    // O userId deve vir no corpo da requisição (FormData)
    const userId = req.body.userId;

    if (!file) {
      return res
        .status(400)
        .json({success: false, error: "Envie uma imagem da planta."});
    }

    // 1. Determina qual API Key usar
    let apiKey = process.env.GEMINI_API_KEY?.trim();

    if (userId) {
      const userSettings = await Settings.findOne({userId});
      if (userSettings && userSettings.geminiApiKey) {
        apiKey = decrypt(userSettings.geminiApiKey);
        console.log(`🔑 Usando chave personalizada do usuário ${userId}`);
      }
    }

    if (!apiKey) {
      return res
        .status(500)
        .json({success: false, error: "Chave de API não configurada."});
    }

    // 2. Instancia o cliente com a chave correta
    const ai = new GoogleGenAI({apiKey});
    const base64Image = file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {inlineData: {mimeType: file.mimetype, data: base64Image}},
        "Analise a imagem desta planta e identifique sua espécie. Avalie também o seu estado de saúde visível. Preencha todos os campos do schema solicitado com precisão.",
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const plantData = JSON.parse(response.text);
    return res.json({success: true, ...plantData});
  } catch (error) {
    console.error("Erro Gemini:", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao consultar IA",
      details: error.message,
    });
  }
};
