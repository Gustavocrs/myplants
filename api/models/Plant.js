const mongoose = require("mongoose");

const PlantSchema = new mongoose.Schema({
  nome: {type: String, required: true},
  nomeCientifico: String,
  apelido: String,
  luz: {
    type: String,
    enum: ["Sombra", "Meia-sombra", "Luz Difusa", "Sol Pleno"],
    default: "Meia-sombra",
  },
  intervaloRega: {type: Number, required: true}, // em dias
  petFriendly: {type: Boolean, default: false},
  ultimaRega: Date,
  dataAquisicao: Date,
  imagemUrl: String,
  lembretesAtivos: {type: Boolean, default: true},
  observacoes: String,
  userId: {type: String, required: true},
  userEmail: {type: String}, // Email para notificações
  notificationSent: {type: Boolean, default: false}, // Controle para não spammar
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model("Plant", PlantSchema);
