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

// PUT - Atualização em massa (Antes de /:id)
router.put("/batch", plantsController.batchUpdate);

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
    // Usar findByIdAndUpdate para evitar problemas de validação em campos não relacionados.
    // A validação do Mongoose no .save() verifica o documento inteiro, o que causa
    // o erro se um campo antigo (como 'luz') tiver um valor inválido.
    // findByIdAndUpdate atualiza atomicamente apenas os campos especificados.
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      {$set: {ultimaRega: new Date(), notificationSent: false}},
      {new: false}, // Retorna o documento original para usar os dados na resposta
    );

    if (!plant) return res.status(404).send("Planta não encontrada");

    res.send(`
      <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
        <h1 style="color: #16a34a;">Rega Confirmada! 💧</h1>
        <p>A data da última rega da <strong>${plant.nome}</strong> foi atualizada.</p>
        <p>Próximo lembrete em ${plant.intervaloRega} dias.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Erro ao confirmar a rega: " + err.message);
  }
});

module.exports = router;
