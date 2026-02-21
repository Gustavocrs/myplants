const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  userId: {type: String, required: true, unique: true},
  geminiApiKey: {type: String}, // Chave pessoal do usuário
  smtp: {
    host: String,
    port: Number,
    user: String,
    pass: String,
    secure: {type: Boolean, default: false},
    fromEmail: String, // Email que aparecerá no remetente
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
