const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = {
  getPlants: async (userId) => {
    const url = userId
      ? `${API_URL}/plants?userId=${userId}`
      : `${API_URL}/plants`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar plantas");
    return response.json();
  },

  createPlant: async (plantData) => {
    const response = await fetch(`${API_URL}/plants`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(plantData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error ||
          `Erro HTTP ${response.status}: ${response.statusText}`,
      );
    }
    return response.json();
  },

  updatePlant: async (id, plantData) => {
    const response = await fetch(`${API_URL}/plants/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(plantData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error ||
          `Erro HTTP ${response.status}: ${response.statusText}`,
      );
    }
    return response.json();
  },

  deletePlant: async (id) => {
    const response = await fetch(`${API_URL}/plants/${id}`, {method: "DELETE"});
    if (!response.ok) throw new Error("Erro ao excluir planta");
    return response.json();
  },

  identifyPlant: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("prompt", "Identifique esta planta");

    const response = await fetch(`${API_URL}/identify`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.error ||
        `Erro HTTP ${response.status}: ${response.statusText}`;
      const errorDetails = errorData?.details ? ` - ${errorData.details}` : "";
      throw new Error(errorMessage + errorDetails);
    }
    return response.json();
  },
};
