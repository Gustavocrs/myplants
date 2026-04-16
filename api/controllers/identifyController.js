const { GoogleGenAI, Type } = require("@google/genai");
const Settings = require("../models/Settings");
const { decrypt } = require("../utils/crypto");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const MODEL_NAME = process.env.GEMINI_MODEL
  ? process.env.GEMINI_MODEL.trim()
  : "gemini-2.5-flash";

async function convertHeicToJpeg(buffer) {
  return await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
}

async function optimizeImageForAI(buffer) {
  return await sharp(buffer)
    .resize(1024, 1024, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

function isHeicFormat(mimeType, filename) {
  const heicMimes = ["image/heic", "image/heif", "image/x-heic"];
  const ext = path.extname(filename || "").toLowerCase();
  return heicMimes.includes(mimeType) || ext === ".heic" || ext === ".heif";
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    nome: { type: Type.STRING },
    nomeCientifico: { type: Type.STRING },
    luz: {
      type: Type.STRING,
      enum: ["Sombra", "Meia-sombra", "Luz Difusa", "Sol Pleno"],
    },
    intervaloRega: { type: Type.INTEGER },
    petFriendly: { type: Type.BOOLEAN },
    observacoes: { type: Type.STRING },
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
    // O userId deve vir no corpo da requisição (FormData)
    const userId = req.body.userId;
    const hint = req.body.hint;
    let base64Image;
    let mimeType;

    if (req.file) {
      // Caso 1: Upload de nova imagem - Otimiza antes de enviar para a IA
      let imageBuffer = req.file.buffer;
      imageBuffer = await optimizeImageForAI(imageBuffer);
      mimeType = "image/jpeg";
      base64Image = imageBuffer.toString("base64");
    } else if (req.body.currentImageUrl) {
      // Caso 2: Imagem já existente no servidor (Lê do disco local e otimiza)
      try {
        const fileName = req.body.currentImageUrl.split("/").pop();
        const filePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          fileName,
        );

        if (!fs.existsSync(filePath)) throw new Error("Arquivo não encontrado");

        let buffer = fs.readFileSync(filePath);
        // Mesmo que já esteja no servidor, garantimos que o buffer enviado para a IA seja leve
        buffer = await optimizeImageForAI(buffer);
        base64Image = buffer.toString("base64");
        mimeType = "image/jpeg";
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: "Não foi possível acessar a imagem no servidor.",
        });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Envie uma imagem da planta." });
    }

    // 1. Determina qual API Key usar
    let apiKey = process.env.GEMINI_API_KEY?.trim();

    if (userId) {
      const userSettings = await Settings.findOne({ userId });
      if (userSettings && userSettings.geminiApiKey) {
        apiKey = decrypt(userSettings.geminiApiKey);
      }
    }

    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, error: "Chave de API não configurada." });
    }

    // 2. Instancia o cliente com a chave correta
    const ai = new GoogleGenAI({ apiKey });

    let promptStr =
      "Analise a imagem desta planta e identifique sua espécie. Avalie também o seu estado de saúde visível. Preencha todos os campos do schema solicitado com precisão. Para o campo 'luz', use estritamente um destes valores: 'Sombra', 'Meia-sombra', 'Luz Difusa', 'Sol Pleno'.";

    if (hint && hint.trim() !== "") {
      promptStr += ` O usuário sugeriu que o nome popular da planta possa ser "${hint.trim()}". Considere fortemente essa informação como dica para a identificação, validando-a com o que você vê na imagem.`;
    }

    let response;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            { inlineData: { mimeType: mimeType, data: base64Image } },
            promptStr,
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        break; // Sucesso, sai do loop
      } catch (err) {
        retryCount++;
        const isOverloaded =
          err.status === 503 ||
          (err.message && err.message.includes("high demand"));

        if (isOverloaded && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2s antes de tentar de novo
        } else {
          throw err;
        }
      }
    }

    const plantData = JSON.parse(response.text);

    // Sanitização de segurança: garante que o valor de 'luz' seja válido para o Mongoose
    const validLuz = ["Sombra", "Meia-sombra", "Luz Difusa", "Sol Pleno"];

    // Força o valor a ser um dos permitidos ou usa fallback
    let luzCorrigida = "Meia-sombra";
    if (plantData.luz) {
      const valorIA = String(plantData.luz).trim();
      // Tenta achar correspondência exata ou parcial (case-insensitive)
      const match = validLuz.find((v) =>
        valorIA.toLowerCase().includes(v.toLowerCase()),
      );
      if (match) luzCorrigida = match;
    }
    plantData.luz = luzCorrigida;

    return res.json({ success: true, ...plantData });
  } catch (error) {
    console.error("Erro Gemini:", error);

    let errorMessage = error.message || "";
    let retryAfter = null;

    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error?.message) {
        errorMessage = parsed.error.message;
        if (parsed.error.status === "RESOURCE_EXHAUSTED") {
          const details = parsed.error.details;
          const retryInfo = details?.find((d) =>
            d["@type"]?.includes("RetryInfo"),
          );
          if (retryInfo?.retryDelay) {
            const delaySeconds = parseInt(
              retryInfo.retryDelay.replace("s", ""),
            );
            retryAfter = delaySeconds;
          }
        }
      }
    } catch (e) {}

    const msgLower = errorMessage.toLowerCase();

    if (
      msgLower.includes("api key expired") ||
      msgLower.includes("api_key_invalid") ||
      msgLower.includes("api key")
    ) {
      return res.status(403).json({
        success: false,
        error: "api_key_expired",
        message:
          "A chave de acesso à IA expirou. Por favor, renove nas Configurações.",
        action: "renew_api_key",
      });
    }

    if (
      msgLower.includes("quota") ||
      msgLower.includes("rate limit") ||
      msgLower.includes("resource_exhausted") ||
      msgLower.includes("429")
    ) {
      const isDailyLimit =
        msgLower.includes("GenerateRequestsPerDay") ||
        msgLower.includes("per day") ||
        msgLower.includes("daily");
      const quotaType = isDailyLimit ? "daily" : "burst";

      let msg;
      let action;
      if (isDailyLimit) {
        msg =
          "Limite diário de uso da IA atingido. Acesse as Configurações para usar outra chave de API.";
        action = "renew_api_key";
      } else {
        msg = retryAfter
          ? `Limite de uso da IA atingido. Tente novamente em ~${retryAfter}s.`
          : "Limite de uso da IA atingido. Tente novamente mais tarde.";
        action = "wait_or_upgrade";
      }

      return res.status(429).json({
        success: false,
        error: "api_quota_exceeded",
        message: msg,
        action,
        quotaType,
        retryAfter: isDailyLimit ? null : retryAfter,
      });
    }

    if (msgLower.includes("network") || msgLower.includes("fetch")) {
      return res.status(503).json({
        success: false,
        error: "network_error",
        message: "Ops! Problema de conexão. Verifique sua internet.",
        action: "retry",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erro ao consultar IA",
      message: "Ocorreu um erro ao processar sua solicitação.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
