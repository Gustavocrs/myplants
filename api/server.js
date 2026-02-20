require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const plantsRoutes = require("./routes/plants");
const identifyRoutes = require("./routes/identify");

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📦 MongoDB conectado com sucesso!"))
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));

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
