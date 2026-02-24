const Settings = require("../models/Settings");
const {encrypt} = require("../utils/crypto");

exports.getSettings = async (req, res) => {
  try {
    const {userId} = req.params;
    const settings = await Settings.findOne({userId});
    // Não retornamos a senha do email por segurança, ou retornamos mascarada se necessário
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {userId} = req.params;
    const {geminiApiKey, smtp, slug, isPublic, displayName} = req.body;

    // Criptografa dados sensíveis antes de salvar
    const encryptedApiKey = geminiApiKey ? encrypt(geminiApiKey) : undefined;
    const encryptedSmtpPass =
      smtp && smtp.pass ? encrypt(smtp.pass) : undefined;

    // Prepara objeto de atualização mantendo outros campos do SMTP se necessário
    // Nota: Para simplificar, assumimos que o frontend envia o objeto smtp completo ou tratamos aqui

    // Validação simples do slug
    if (slug && /[^a-z0-9-]/.test(slug)) {
      return res.status(400).json({
        error: "O link deve conter apenas letras minúsculas, números e hífens.",
      });
    }

    const updateData = {
      userId,
      slug,
      isPublic,
      displayName,
    };
    if (encryptedApiKey) updateData.geminiApiKey = encryptedApiKey;
    if (smtp) {
      updateData.smtp = {...smtp};
      if (encryptedSmtpPass) {
        updateData.smtp.pass = encryptedSmtpPass;
      }
    }

    const settings = await Settings.findOneAndUpdate(
      {userId},
      updateData,
      {new: true, upsert: true, runValidators: true}, // Cria se não existir
    );

    res.json(settings);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({error: "Este link já está em uso. Por favor, escolha outro."});
    }
    res.status(400).json({error: err.message});
  }
};
