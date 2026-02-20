const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = {
  getPlants: async () => {
    const response = await fetch(`${API_URL}/plants`);
    if (!response.ok) throw new Error("Erro ao buscar plantas");
    return response.json();
  },

  createPlant: async (plantData) => {
    const response = await fetch(`${API_URL}/plants`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(plantData),
    });
    if (!response.ok) throw new Error("Erro ao criar planta");
    return response.json();
  },

  updatePlant: async (id, plantData) => {
    const response = await fetch(`${API_URL}/plants/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(plantData),
    });
    if (!response.ok) throw new Error("Erro ao atualizar planta");
    return response.json();
  },

  deletePlant: async (id) => {
    const response = await fetch(`${API_URL}/plants/${id}`, {method: "DELETE"});
    if (!response.ok) throw new Error("Erro ao excluir planta");
    return response.json();
  },
};
