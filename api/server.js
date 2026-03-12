require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

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

// Configuração de Arquivos Estáticos (Uploads)
const uploadsDir = path.join(__dirname, "public", "uploads");
console.log(`📂 [Server] Diretório de Uploads configurado em: ${uploadsDir}`);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {recursive: true});
}
// Serve a pasta public/uploads na rota /uploads
app.use("/uploads", express.static(uploadsDir));

// Middleware de Debug para arquivos não encontrados (404 em uploads)
app.use("/uploads", (req, res) => {
  console.warn(
    `⚠️ [Server] Arquivo não encontrado: ${req.path} (buscado em ${uploadsDir})`,
  );
  res.status(404).send("Imagem não encontrada");
});

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
app.use("/plants", plantsRoutes);
app.use("/identify", identifyRoutes);
app.use("/settings", settingsRoutes);
app.use("/public", publicRoutes);

// Rota de Health Check
app.get("/", (req, res) => {
  res.json({message: "API MyPlants rodando! 🌱"});
});

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
