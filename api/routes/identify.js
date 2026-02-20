const express = require("express");
const router = express.Router();
const multer = require("multer");
const {GoogleGenerativeAI} = require("@google/generative-ai");

// Configuração do Multer para salvar na memória (RAM) temporariamente
const upload = multer({storage: multer.memoryStorage()});

// Inicializa o Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: "Nenhuma imagem enviada."});
    }

    // Converte o buffer da imagem para o formato que o Gemini aceita
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    const prompt = `
      Identifique esta planta.
      Retorne APENAS um objeto JSON (sem markdown, sem crases) com a seguinte estrutura:
      {
        "nome": "Nome popular da planta em PT-BR",
        "nomeCientifico": "Nome científico",
        "luz": "Escolha um: 'Sombra', 'Meia-sombra', 'Luz Difusa' ou 'Sol Pleno'",
        "intervaloRega": numero_de_dias_para_regar (apenas o número inteiro, ex: 7),
        "petFriendly": true ou false (se é segura para pets),
        "observacoes": "Breve descrição e cuidados principais (max 200 caracteres)"
      }
      Se a imagem não for de uma planta, retorne um JSON com { "error": "Não é uma planta" }.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Limpeza para garantir que venha apenas o JSON
    const jsonString = text.replace(/```json|```/g, "").trim();

    try {
      const plantData = JSON.parse(jsonString);

      if (plantData.error) {
        return res.status(400).json({error: plantData.error});
      }

      // Retorna os dados para o frontend preencher o formulário
      res.json(plantData);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON do Gemini:", text);
      res.status(500).json({error: "Falha ao processar resposta da IA."});
    }
  } catch (error) {
    console.error("Erro na identificação:", error);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
