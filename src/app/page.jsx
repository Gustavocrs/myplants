// app/page.js
"use client";

import {useState, useEffect} from "react";
import {useAuth} from "@/context/AuthContext";
import FloatingMenu from "../components/FloatingMenu";
import AddPlantModal from "../components/AddPlantModal";
import PlantCard from "../components/PlantCard";
import {api} from "../services/api";

export default function Home() {
  const {user, loginGoogle, logout} = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Função para buscar plantas da API
  const fetchPlants = async () => {
    if (!user) return;
    try {
      setLoadingPlants(true);
      const data = await api.getPlants();
      // Mapeia _id (Mongo) para id (Frontend) e garante que usamos 'nome' ou 'name'
      const formatted = data.map((p) => ({
        ...p,
        id: p._id,
        name: p.nome || p.name,
      }));
      setPlants(formatted);
    } catch (error) {
      console.error("Erro ao buscar plantas:", error);
    } finally {
      setLoadingPlants(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [user]);

  // Função para abrir o modal de edição
  const handleEditPlant = (plant) => {
    setPlantToEdit(plant);
    setIsModalOpen(true);
  };

  // Função para excluir planta
  const handleDeletePlant = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta planta?")) {
      try {
        await api.deletePlant(id);
        fetchPlants(); // Atualiza a lista após excluir
        return true; // Retorna sucesso
      } catch (error) {
        console.error("Erro ao excluir planta:", error);
        return false;
      }
    }
    return false; // Cancelado
  };

  const filteredPlants = plants.filter((plant) =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-gray-100">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md text-center w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-green-700">
            MyPlants 🌱
          </h1>
          <p className="mb-6 text-gray-600">
            Faça login para gerenciar suas plantas
          </p>
          <button
            onClick={loginGoogle}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Entrar com Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 pb-24">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Minhas Plantas</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            Olá, {user.displayName}
          </span>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 text-sm font-semibold"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Barra de Busca */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar plantas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all"
          />
          <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Aqui virá a Grid de Plantas futuramente */}
      <div className="max-w-5xl mx-auto">
        {loadingPlants ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-6xl mb-4">🌵</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Nenhuma planta ainda
            </h3>
            <p className="text-gray-400">
              Toque no botão + para adicionar sua primeira planta.
            </p>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhuma planta encontrada para "{searchTerm}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onClick={handleEditPlant}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingMenu
        onAddPlant={() => setIsModalOpen(true)}
        onAddAI={() => alert("Funcionalidade de IA em breve!")}
      />

      {isModalOpen && (
        <AddPlantModal
          onClose={() => {
            setIsModalOpen(false);
            setPlantToEdit(null);
          }}
          plantToEdit={plantToEdit}
          onSuccess={() => {
            setIsModalOpen(false);
            setPlantToEdit(null);
            fetchPlants(); // Atualiza a lista após salvar
          }}
          onDelete={async (id) => {
            const success = await handleDeletePlant(id);
            if (success) {
              setIsModalOpen(false);
              setPlantToEdit(null);
            }
          }}
        />
      )}
    </main>
  );
}
