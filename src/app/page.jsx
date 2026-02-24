// app/page.js
"use client";

import {useState, useEffect, useRef} from "react";
import {useAuth} from "@/context/AuthContext";
import FloatingMenu from "../components/FloatingMenu";
import AddPlantModal from "../components/AddPlantModal";
import PlantCard from "../components/PlantCard";
import PlantDetailsModal from "../components/PlantDetailsModal";
import SettingsModal from "../components/SettingsModal";
import {api} from "../services/api";

export default function Home() {
  const {user, loginGoogle, logout} = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [plantToView, setPlantToView] = useState(null);
  const [aiInitialData, setAiInitialData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLuz, setFilterLuz] = useState("");
  const [filterRega, setFilterRega] = useState("");
  const [filterPet, setFilterPet] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const aiInputRef = useRef(null);

  // Função para buscar plantas da API
  const fetchPlants = async () => {
    if (!user) return;
    try {
      setLoadingPlants(true);
      const data = await api.getPlants(user.uid);
      // Normaliza apenas o ID, mantendo as chaves originais do banco (nome, imagemUrl, etc)
      const formatted = data.map((p) => ({
        ...p,
        id: p._id,
      }));
      setPlants(formatted);

      // Busca o uso real do armazenamento
      const storageData = await api.getStorageUsage(user.uid);
      console.log("DEBUG - Storage Data:", storageData);
      setStorageUsed(storageData.sizeMB || 0);
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

  // Função chamada ao selecionar foto para IA
  const handleAiImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsAiLoading(true);

      // 1. Identifica a planta
      const data = await api.identifyPlant(file, user.uid);

      // 2. Prepara o preview da imagem para o modal
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // 3. Abre o modal com os dados preenchidos
        setAiInitialData({
          ...data,
          imagemUrl: reader.result, // Passa a imagem em base64 para o modal exibir
        });
        setIsModalOpen(true);
        setIsAiLoading(false);
      };
    } catch (error) {
      console.error("Erro na IA:", error);
      alert(error.message || "Não foi possível identificar a planta.");
      setIsAiLoading(false);
    } finally {
      // Limpa o input para permitir selecionar a mesma foto se quiser
      e.target.value = "";
    }
  };

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.nome
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLuz = filterLuz ? plant.luz === filterLuz : true;
    const matchesPet =
      filterPet === "sim"
        ? plant.petFriendly
        : filterPet === "nao"
          ? !plant.petFriendly
          : true;

    let matchesRega = true;
    if (filterRega === "alta") matchesRega = plant.intervaloRega <= 3;
    else if (filterRega === "media")
      matchesRega = plant.intervaloRega > 3 && plant.intervaloRega <= 7;
    else if (filterRega === "baixa") matchesRega = plant.intervaloRega > 7;

    return matchesSearch && matchesLuz && matchesPet && matchesRega;
  });

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

  const storageLimit = 30; // 30MB
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  const formatSize = (mb) => {
    if (mb < 1) {
      return `${(mb * 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl md:text-3xl font-bold text-green-800">
            Minhas Plantas
          </h1>
          {!loadingPlants && plants && (
            <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
              {plants.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            Olá, {user.displayName}
          </span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-600 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Configurações"
          >
            ⚙️
          </button>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 text-sm font-semibold"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Barra de Armazenamento */}
      <div className="max-w-5xl mx-auto mb-4 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${storagePercent > 90 ? "bg-red-500" : "bg-green-500"}`}
            style={{width: `${storagePercent}%`}}
          />
        </div>
        <span>
          {formatSize(storageUsed)} / {storageLimit} MB
        </span>
      </div>

      {/* Barra de Busca */}
      <div className="max-w-5xl mx-auto mb-6 space-y-4">
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

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterLuz}
            onChange={(e) => setFilterLuz(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">☀️ Todas as Luminosidades</option>
            <option value="Sombra">Sombra</option>
            <option value="Meia-sombra">Meia-sombra</option>
            <option value="Luz Difusa">Luz Difusa</option>
            <option value="Sol Pleno">Sol Pleno</option>
          </select>

          <select
            value={filterRega}
            onChange={(e) => setFilterRega(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">💧 Todas as Regas</option>
            <option value="alta">Alta Frequência (1-3 dias)</option>
            <option value="media">Média Frequência (4-7 dias)</option>
            <option value="baixa">Baixa Frequência (7+ dias)</option>
          </select>

          <select
            value={filterPet}
            onChange={(e) => setFilterPet(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">🐶 Pet Friendly (Todos)</option>
            <option value="sim">Sim (Seguro)</option>
            <option value="nao">Não (Tóxico/Cuidado)</option>
          </select>

          {(filterLuz || filterRega || filterPet) && (
            <button
              onClick={() => {
                setFilterLuz("");
                setFilterRega("");
                setFilterPet("");
              }}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          )}
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
              Nenhuma planta encontrada com esses filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onClick={(p) => setPlantToView(p)}
                onEdit={handleEditPlant}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loading Overlay para IA */}
      {isAiLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-xl font-medium animate-pulse">
            Consultando a IA...
          </p>
        </div>
      )}

      {/* Input oculto para IA */}
      <input
        type="file"
        hidden
        ref={aiInputRef}
        accept="image/*"
        onChange={handleAiImageSelect}
      />

      <FloatingMenu
        onAddPlant={() => setIsModalOpen(true)}
        onAddAI={() => aiInputRef.current?.click()}
      />

      {isModalOpen && (
        <AddPlantModal
          onClose={() => {
            setIsModalOpen(false);
            setPlantToEdit(null);
            setAiInitialData(null);
          }}
          plantToEdit={plantToEdit}
          initialData={aiInitialData}
          onSuccess={() => {
            setIsModalOpen(false);
            setPlantToEdit(null);
            setAiInitialData(null);
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

      {plantToView && (
        <PlantDetailsModal
          plant={plantToView}
          onClose={() => setPlantToView(null)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </main>
  );
}
