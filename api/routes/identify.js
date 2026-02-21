const express = require("express");
const multer = require("multer");
const {GoogleGenAI, Type, Schema} = require("@google/genai");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

const apiKey = process.env.GEMINI_API_KEY.trim();
if (!apiKey) {
  console.error("❌ ERRO CRÍTICO: GEMINI_API_KEY não encontrada!");
}

const ai = new GoogleGenAI({apiKey});

const MODEL_NAME = process.env.GEMINI_MODEL
  ? process.env.GEMINI_MODEL.trim()
  : "gemini-2.5-flash";

// Definindo o formato exato que queremos que a IA retorne
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    nome: {
      type: Type.STRING,
      description: "Nome popular da planta em português do Brasil.",
    },
    nomeCientifico: {
      type: Type.STRING,
      description: "Nome botânico/científico correto.",
    },
    luz: {
      type: Type.STRING,
      description:
        "Condição ideal de luz. Escolha estritamente entre: Sombra, Meia-sombra, Luz Difusa ou Sol Pleno.",
    },
    intervaloRega: {
      type: Type.INTEGER,
      description: "Intervalo médio de dias entre cada rega.",
    },
    petFriendly: {
      type: Type.BOOLEAN,
      description:
        "Verdadeiro se a planta for totalmente segura para cães e gatos, falso se for tóxica.",
    },
    observacoes: {
      type: Type.STRING,
      description:
        "Dicas de cultivo, avaliação visual da saúde da planta pela foto e possíveis problemas.",
    },
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

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({success: false, error: "Envie uma imagem da planta."});
    }

    console.log(`🤖 Consultando IA com modelo: '${MODEL_NAME}'`);

    const base64Image = file.buffer.toString("base64");

    // Instruções claras e diretas para o modelo
    const promptInstructions =
      "Analise a imagem desta planta e identifique sua espécie. Avalie também o seu estado de saúde visível. Preencha todos os campos do schema solicitado com precisão.";

    const contents = [
      {
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image,
        },
      },
      promptInstructions,
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // A IA já retorna a string formatada como JSON puro
    const plantData = JSON.parse(response.text);

    // Retorna as propriedades desestruturadas para o modal ler corretamente
    return res.json({
      success: true,
      ...plantData,
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
