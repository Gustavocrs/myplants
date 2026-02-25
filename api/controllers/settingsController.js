const Settings = require("../models/Settings");
const {encrypt} = require("../utils/crypto");
const {sendTestEmail} = require("../services/notificationService");

exports.getSettings = async (req, res) => {
  try {
    const {userId} = req.params;
    const settings = await Settings.findOne({userId}).lean();

    // Não retornamos segredos para o frontend para evitar re-criptografia acidental
    if (settings) {
      if (settings.smtp) delete settings.smtp.pass;
      if (settings.geminiApiKey) delete settings.geminiApiKey;
    }

    res.json(settings || {});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {userId} = req.params;
    const {geminiApiKey, smtp, slug, isPublic, displayName, savedViews} =
      req.body;

    // Validação simples do slug
    if (slug && /[^a-z0-9-]/.test(slug)) {
      return res.status(400).json({
        error: "O link deve conter apenas letras minúsculas, números e hífens.",
      });
    }

    const updateOps = {
      $set: {
        userId,
        slug,
        isPublic,
        displayName,
      },
    };

    if (savedViews) {
      updateOps.$set.savedViews = savedViews;
    }

    // Só atualiza a chave se o usuário digitou algo novo (não vazia)
    if (geminiApiKey && geminiApiKey.trim() !== "") {
      updateOps.$set.geminiApiKey = encrypt(geminiApiKey);
    }

    if (smtp) {
      updateOps.$set["smtp.host"] = smtp.host;
      updateOps.$set["smtp.port"] = smtp.port;
      updateOps.$set["smtp.user"] = smtp.user;
      updateOps.$set["smtp.secure"] = smtp.secure;
      updateOps.$set["smtp.fromEmail"] = smtp.fromEmail;

      // Só atualiza a senha se o usuário digitou algo novo
      if (smtp.pass && smtp.pass.trim() !== "") {
        updateOps.$set["smtp.pass"] = encrypt(smtp.pass);
      }
    }

    const settings = await Settings.findOneAndUpdate(
      {userId},
      updateOps,
      {new: true, upsert: true, runValidators: true}, // Cria se não existir
    );

    // Retorna o objeto atualizado sem os segredos
    const responseData = settings.toObject();
    if (responseData.smtp) delete responseData.smtp.pass;
    if (responseData.geminiApiKey) delete responseData.geminiApiKey;

    res.json(responseData);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({error: "Este link já está em uso. Por favor, escolha outro."});
    }
    res.status(400).json({error: err.message});
  }
};

exports.testNotification = async (req, res) => {
  try {
    const {userId} = req.params;
    const {targetEmail} = req.body;
    await sendTestEmail(userId, targetEmail);
    res.json({success: true, message: "E-mail enviado com sucesso!"});
  } catch (err) {
    res.status(500).json({error: "Erro ao enviar e-mail: " + err.message});
  }
};
