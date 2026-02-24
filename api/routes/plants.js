const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant");
const plantsController = require("../controllers/plantsController");

// GET - Listar todas as plantas
router.get("/", plantsController.getAllPlants);

// GET - Consultar uso de armazenamento (Antes de /:id)
router.get("/storage", plantsController.getStorageUsage);

// POST - Criar nova planta
router.post("/", plantsController.createPlant);

// PUT - Atualizar planta
router.put("/:id", plantsController.updatePlant);

// DELETE - Remover planta
router.delete("/:id", plantsController.deletePlant);

// GET - Confirmar rega (Link do Email)
// Mantivemos a lógica aqui ou podemos mover para o controller também.
// Para consistência, vamos manter a lógica inline aqui pois retorna HTML,
// mas o ideal seria estar no controller.
router.get("/:id/water", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).send("Planta não encontrada");

    plant.ultimaRega = new Date();
    plant.notificationSent = false; // Reseta para permitir nova notificação no futuro
    await plant.save();

    res.send(`
      <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
        <h1 style="color: #16a34a;">Rega Confirmada! 💧</h1>
        <p>A data da última rega da <strong>${plant.nome}</strong> foi atualizada.</p>
        <p>Próximo lembrete em ${plant.intervaloRega} dias.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Erro ao confirmar rega: " + err.message);
  }
});

module.exports = router;
