const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  userId: {type: String, required: true, unique: true},
  slug: {type: String, unique: true, sparse: true, trim: true}, // Link personalizado
  isPublic: {type: Boolean, default: false},
  displayName: {type: String}, // Nome para exibição pública
  emailNotificationsEnabled: {type: Boolean, default: true}, // Controle global de notificações
  geminiApiKey: {type: String}, // Chave pessoal do usuário
  gridMode: {type: String, default: "2", enum: ["1", "2", "list"]}, // Layout do jardim
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
  frequenciaEnvio: {
    type: String,
    enum: ["diario", "hora"],
    default: "diario",
  },
  horaDisparo: {
    type: Number,
    min: 0,
    max: 23,
    default: 8, // Padrão: 8 da manhã
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
