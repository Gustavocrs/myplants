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
    const {geminiApiKey, smtp} = req.body;

    const settings = await Settings.findOneAndUpdate(
      {userId},
      {userId, geminiApiKey, smtp},
      {new: true, upsert: true}, // Cria se não existir
    );

    res.json(settings);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
};
