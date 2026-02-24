const Settings = require("../models/Settings");

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

    // Validação simples do slug
    if (slug && /[^a-z0-9-]/.test(slug)) {
      return res
        .status(400)
        .json({
          error:
            "O link deve conter apenas letras minúsculas, números e hífens.",
        });
    }

    const settings = await Settings.findOneAndUpdate(
      {userId},
      {userId, geminiApiKey, smtp, slug, isPublic, displayName},
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
