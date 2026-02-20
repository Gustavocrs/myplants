require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const plantsRoutes = require("./routes/plants");
const identifyRoutes = require("./routes/identify");

// Middlewares
// Configuração de CORS ajustada para permitir o localhost do NextJS
// e preparar para o domínio de produção.
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://myplants-guts.vercel.app",
      "https://myplants-api.systechdev.com.br", // Lembre-se de alterar para o domínio real do seu frontend no Vercel/Netlify
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

// Conexão com MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 MongoDB conectado com sucesso!");
  } catch (err) {
    console.error(
      "Erro ao conectar no MongoDB. Tentando novamente em 5 segundos...",
      err.message,
    );
    setTimeout(connectDB, 5000);
  }
};

// Inicia a conexão
connectDB();

// Rotas
app.use("/api/plants", plantsRoutes);
app.use("/api/identify", identifyRoutes);

// Rota de Health Check
app.get("/", (req, res) => {
  res.json({message: "API MyPlants rodando! 🌱"});
});

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
