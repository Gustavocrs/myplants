const express = require("express");
const router = express.Router();
const multer = require("multer");
const {GoogleGenAI} = require("@google/genai");

// Configuração do Multer para salvar na memória (RAM) temporariamente
const upload = multer({storage: multer.memoryStorage()});

// Inicializa o Gemini
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: "Nenhuma imagem enviada."});
    }

    const prompt = `
      Identifique esta planta.
      Analise a imagem para identificar possíveis problemas de saúde (folhas amareladas, manchas, murcha, pragas) e sugira melhorias.
      Retorne APENAS um objeto JSON (sem markdown, sem crases) com a seguinte estrutura:
      {
        "nome": "Nome popular da planta em PT-BR",
        "nomeCientifico": "Nome científico",
        "luz": "Escolha um: 'Sombra', 'Meia-sombra', 'Luz Difusa' ou 'Sol Pleno'",
        "intervaloRega": numero_de_dias_para_regar (apenas o número inteiro, ex: 7),
        "petFriendly": true ou false (se é segura para pets),
        "observacoes": "Descrição, cuidados básicos e uma avaliação do estado de saúde da planta com dicas de melhoria se aplicável."
      }
      Se a imagem não for de uma planta, retorne um JSON com { "error": "Não é uma planta" }.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {text: prompt},
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString("base64"),
          },
        },
      ],
      config: {responseMimeType: "application/json"},
    });

    const text = response.text;
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
