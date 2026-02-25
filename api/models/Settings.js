const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  userId: {type: String, required: true, unique: true},
  slug: {type: String, unique: true, sparse: true, trim: true}, // Link personalizado
  isPublic: {type: Boolean, default: false},
  displayName: {type: String}, // Nome para exibição pública
  geminiApiKey: {type: String}, // Chave pessoal do usuário
  smtp: {
    host: String,
    port: Number,
    user: String,
    pass: String,
    secure: {type: Boolean, default: false},
    fromEmail: String, // Email que aparecerá no remetente
  },
  savedViews: [
    {
      name: {type: String, required: true},
      filters: {
        luz: String,
        rega: String,
        pet: String,
      },
    },
  ],
});

module.exports = mongoose.model("Settings", SettingsSchema);
