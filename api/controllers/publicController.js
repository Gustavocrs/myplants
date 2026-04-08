const Settings = require("../models/Settings");
const Plant = require("../models/Plant");

exports.getPublicProfile = async (req, res) => {
  try {
    const {slug} = req.params;

    // 1. Busca as configurações pelo slug e verifica se é público
    const settings = await Settings.findOne({slug, isPublic: true});

    if (!settings) {
      return res.status(404).json({error: "Perfil não encontrado ou privado."});
    }

    // 2. Busca as plantas do usuário associado
    const plants = await Plant.find({userId: settings.userId})
      .select("-userEmail -userId -notificationSent") // Remove dados sensíveis
      .sort({nome: 1});

    res.json({
      profile: {
        displayName: settings.displayName || "Usuário MyPlants",
        slug: settings.slug,
      },
      plants,
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};
