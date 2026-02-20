const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant");

// GET - Listar todas as plantas
router.get("/", async (req, res) => {
  try {
    const {userId} = req.query;
    const filter = userId ? {userId} : {};
    const plants = await Plant.find(filter)
      .collation({locale: "pt", strength: 1}) // Ordenação correta em PT-BR (ignora case)
      .sort({nome: 1});
    res.json(plants);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// POST - Criar nova planta
router.post("/", async (req, res) => {
  try {
    const newPlant = new Plant(req.body);
    const savedPlant = await newPlant.save();
    res.status(201).json(savedPlant);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// PUT - Atualizar planta
router.put("/:id", async (req, res) => {
  try {
    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true},
    );
    res.json(updatedPlant);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

// DELETE - Remover planta
router.delete("/:id", async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({message: "Planta removida com sucesso"});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
