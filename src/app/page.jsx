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
  const [savedViews, setSavedViews] = useState([]);
  const [viewMode, setViewMode] = useState(null); // null | 'luz' | 'rega' | 'pet'
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
      setStorageUsed(storageData.sizeMB || 0);
    } catch (error) {
      console.error("Erro ao buscar plantas:", error);
    } finally {
      setLoadingPlants(false);
    }
  };

  // Busca configurações para obter visualizações salvas
  const fetchSettings = async () => {
    if (!user) return;
    try {
      const settings = await api.getSettings(user.uid);
      if (settings && settings.savedViews) {
        setSavedViews(settings.savedViews);
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }
  };

  useEffect(() => {
    fetchPlants();
    fetchSettings();
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

  const applyView = (viewName) => {
    if (!viewName) return;
    const view = savedViews.find((v) => v.name === viewName);
    if (view) {
      setFilterLuz(view.filters.luz || "");
      setFilterRega(view.filters.rega || "");
      setFilterPet(view.filters.pet || "");
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
    if (filterRega === "cacto") matchesRega = plant.intervaloRega > 7;
    else if (filterRega === "1gota")
      matchesRega = plant.intervaloRega > 4 && plant.intervaloRega <= 7;
    else if (filterRega === "2gotas")
      matchesRega = plant.intervaloRega > 2 && plant.intervaloRega <= 4;
    else if (filterRega === "3gotas") matchesRega = plant.intervaloRega <= 2;

    return matchesSearch && matchesLuz && matchesPet && matchesRega;
  });

  // Helpers para o Modo de Exibição
  const getViewGroups = (mode) => {
    if (mode === "luz")
      return ["Sombra", "Meia-sombra", "Luz Difusa", "Sol Pleno"];
    if (mode === "rega") return ["cacto", "1gota", "2gotas", "3gotas"];
    if (mode === "pet") return ["sim", "nao"];
    return [];
  };

  const getGroupLabel = (mode, value) => {
    if (mode === "luz") return value;
    if (mode === "pet")
      return value === "sim" ? "Pet Friendly 🐶" : "Tóxica 🚫";
    if (mode === "rega") {
      if (value === "cacto") return "Espaçada (> 7 dias) 🌵";
      if (value === "1gota") return "Moderada (5-7 dias) 💧";
      if (value === "2gotas") return "Frequente (3-4 dias) 💧💧";
      if (value === "3gotas") return "Intensa (1-2 dias) 💧💧💧";
    }
    return value;
  };

  const checkPlantGroup = (plant, mode, value) => {
    if (mode === "luz") return plant.luz === value;
    if (mode === "pet")
      return value === "sim" ? plant.petFriendly : !plant.petFriendly;
    if (mode === "rega") {
      if (value === "cacto") return plant.intervaloRega > 7;
      if (value === "1gota")
        return plant.intervaloRega > 4 && plant.intervaloRega <= 7;
      if (value === "2gotas")
        return plant.intervaloRega > 2 && plant.intervaloRega <= 4;
      if (value === "3gotas") return plant.intervaloRega <= 2;
    }
    return false;
  };

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

  const storageLimit = 10; // 10MB
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
          <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center gap-2">
            <span className="text-3xl">🌱</span>
            <span className="hidden md:inline">Minhas Plantas</span>
          </h1>
          {!loadingPlants && plants && (
            <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
              {plants.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden md:block">
            Olá, {user.displayName}
          </span>
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
      <div className="max-w-5xl mx-auto mb-6 space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Seletor de Modos de Visualização */}
        {savedViews.length > 0 && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Modos Salvos:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {savedViews.map((view) => (
                <button
                  key={view.name}
                  onClick={() => applyView(view.name)}
                  className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full hover:bg-green-100 transition-colors whitespace-nowrap border border-green-100"
                >
                  {view.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Indicador de Filtros Ativos (Já que os controles estão no menu) */}
        {(filterLuz || filterRega || filterPet || viewMode) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filterLuz && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200 flex items-center gap-1">
                ☀️ {filterLuz}
              </span>
            )}
            {filterRega && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                💧{" "}
                {filterRega === "cacto"
                  ? "Espaçada"
                  : filterRega === "1gota"
                    ? "Moderada"
                    : filterRega === "2gotas"
                      ? "Frequente"
                      : "Intensa"}
              </span>
            )}
            {filterPet && (
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1 shadow-sm">
                🐶 {filterPet === "sim" ? "Pet Friendly" : "Tóxica"}
              </span>
            )}
            {viewMode && (
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200 flex items-center gap-1 shadow-sm">
                👁️{" "}
                {viewMode === "luz"
                  ? "Luz"
                  : viewMode === "rega"
                    ? "Rega"
                    : "Pet"}
              </span>
            )}

            <button
              onClick={() => {
                setFilterLuz("");
                setFilterRega("");
                setFilterPet("");
                setViewMode(null);
              }}
              className="text-xs text-red-500 hover:underline ml-auto"
            >
              Limpar todos
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {/* Filtros removidos daqui e movidos para o FloatingMenu */}
        </div>
      </div>

      {/* Aqui virá a Grid de Plantas futuramente */}
      <div className="max-w-6xl mx-auto">
        {loadingPlants ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
            <div className="text-7xl mb-6 opacity-50">🌵</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhuma planta ainda
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Toque no botão + para adicionar sua primeira planta.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Modo de Exibição Agrupado */}
            {viewMode ? (
              <div className="space-y-4">
                {getViewGroups(viewMode).map((groupValue) => {
                  const groupPlants = filteredPlants.filter((p) =>
                    checkPlantGroup(p, viewMode, groupValue),
                  );

                  if (groupPlants.length === 0) return null;

                  return (
                    <details
                      key={groupValue}
                      open
                      className="group bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-white overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors list-none select-none">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                          {getGroupLabel(viewMode, groupValue)}
                          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {groupPlants.length}
                          </span>
                        </h3>
                        <span className="text-gray-400 transform group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 border-t border-gray-100">
                        {groupPlants.map((plant) => (
                          <PlantCard
                            key={plant.id}
                            plant={plant}
                            onClick={(p) => setPlantToView(p)}
                            onEdit={handleEditPlant}
                          />
                        ))}
                      </div>
                    </details>
                  );
                })}
                {filteredPlants.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Nenhuma planta encontrada com esses filtros.
                    </p>
                  </div>
                )}
              </div>
            ) : filteredPlants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhuma planta encontrada com esses filtros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={logout}
        filterLuz={filterLuz}
        setFilterLuz={setFilterLuz}
        filterRega={filterRega}
        setFilterRega={setFilterRega}
        filterPet={filterPet}
        setFilterPet={setFilterPet}
        viewMode={viewMode}
        setViewMode={setViewMode}
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
        <SettingsModal
          onClose={() => {
            setIsSettingsOpen(false);
            fetchSettings(); // Recarrega settings ao fechar modal para atualizar views se foram deletadas
          }}
        />
      )}
    </main>
  );
}
