require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const plantsRoutes = require("./routes/plants");
const identifyRoutes = require("./routes/identify");
const settingsRoutes = require("./routes/settings");
const publicRoutes = require("./routes/public");
const {startScheduler} = require("./services/notificationService");

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://myplants-guts.vercel.app",
      "https://myplants-api.systechdev.com.br",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

// Conexão com MongoDB Otimizada para o Docker
const connectDB = async () => {
  try {
    console.log(`⏳ Tentando conectar ao MongoDB em: ${process.env.MONGO_URI}`);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
      family: 4, // Pula a tentativa de IPv6 e conecta instantaneamente via IPv4 no Docker
    });
    console.log("📦 MongoDB conectado com sucesso!");
  } catch (err) {
    console.error("❌ Erro crítico de conexão com o MongoDB:", err.message);
    console.log("🔄 Tentando novamente em 5 segundos...");
    setTimeout(connectDB, 5000);
  }
};

// Inicia a conexão
connectDB();

// Inicia o agendador de notificações
startScheduler();

// Rotas
app.use("/api/plants", plantsRoutes);
app.use("/api/identify", identifyRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/public", publicRoutes);

// Rota de Health Check
app.get("/", (req, res) => {
  res.json({message: "API MyPlants rodando! 🌱"});
});

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
