"use client";

import {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "../context/AuthContext";
import {api} from "../services/api";
import PlantCard from "../components/PlantCard";
import AddPlantModal from "../components/AddPlantModal";
import PlantDetailsModal from "../components/PlantDetailsModal";
import FloatingMenu from "../components/FloatingMenu";
import SettingsModal from "../components/SettingsModal";
import {FiSearch, FiWind} from "react-icons/fi";
import LandingPage from "../components/landing/LandingPage";


export default function Home() {
  const {user, loading: authLoading, logout, loginGoogle} = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  // Filtros
  const [filterLuz, setFilterLuz] = useState("");
  const [filterRega, setFilterRega] = useState("");
  const [filterPet, setFilterPet] = useState("");
  const [viewMode, setViewMode] = useState(null);
  const [filterAtrasada, setFilterAtrasada] = useState(false);

  // IA
  const fileInputRef = useRef(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialAiData, setInitialAiData] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // Se não estiver logado, o render abaixo cuida disso
    } else if (user) {
      loadPlants();
    }
  }, [user, authLoading]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const data = await api.getPlants(user.uid);
      setPlants(data);
    } catch (error) {
      console.error("Erro ao carregar plantas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plant) => {
    setPlantToEdit(plant);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: "Tem certeza que deseja excluir esta planta?",
      onConfirm: async () => {
        setConfirmDialog({isOpen: false, message: "", onConfirm: null});
        try {
          await api.deletePlant(id);
          setShowAddModal(false);
          loadPlants();
        } catch (error) {
          alert("Erro ao excluir planta");
        }
      },
    });
  };

  // Função chamada pelo FloatingMenu para iniciar fluxo de IA
  const handleAiScan = () => {
    fileInputRef.current?.click();
  };

  const handleAiImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiLoading(true);
    try {
      // Comprime e converte para base64 para preview imediato no modal
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        const base64 = event.target.result;
        // Envia para o modal preenchido parcialmente
        setInitialAiData({imagemUrl: base64});
        setAiLoading(false);
        setShowAddModal(true);
      };
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      setAiLoading(false);
      alert("Erro ao processar imagem.");
    }
  };

  // Filtra as plantas
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.nomeCientifico &&
        plant.nomeCientifico.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLuz = filterLuz ? plant.luz === filterLuz : true;
    const matchesPet = filterPet
      ? filterPet === "sim"
        ? plant.petFriendly
        : !plant.petFriendly
      : true;

    let matchesRega = true;
    if (filterRega === "cacto") matchesRega = plant.intervaloRega > 7;
    else if (filterRega === "1gota")
      matchesRega = plant.intervaloRega > 3 && plant.intervaloRega <= 7;
    else if (filterRega === "2gotas") matchesRega = plant.intervaloRega <= 3;

    let matchesAtrasada = true;
    if (filterAtrasada) {
      if (!plant.ultimaRega || !plant.intervaloRega) {
        matchesAtrasada = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextDate = new Date(plant.ultimaRega);
        nextDate.setDate(nextDate.getDate() + Number(plant.intervaloRega));
        nextDate.setHours(0, 0, 0, 0);
        matchesAtrasada = today > nextDate;
      }
    }

    return (
      matchesSearch &&
      matchesLuz &&
      matchesRega &&
      matchesPet &&
      matchesAtrasada
    );
  });

  // Navegação do Modal (Vitrine)
  const getSelectedIndex = () => {
    if (!selectedPlant) return -1;
    return filteredPlants.findIndex((p) => p._id === selectedPlant._id);
  };

  const handleNext = () => {
    const idx = getSelectedIndex();
    if (idx !== -1 && idx < filteredPlants.length - 1) {
      setSelectedPlant(filteredPlants[idx + 1]);
    }
  };

  const handlePrev = () => {
    const idx = getSelectedIndex();
    if (idx > 0) {
      setSelectedPlant(filteredPlants[idx - 1]);
    }
  };

  // Atalhos de teclado para navegação
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPlant) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedPlant(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPlant, filteredPlants]);

  // Agrupa as plantas (View Mode)
  const groupedPlants = viewMode
    ? filteredPlants.reduce((acc, plant) => {
        let key = "";
        if (viewMode === "luz") key = plant.luz || "Indefinido";
        else if (viewMode === "pet")
          key = plant.petFriendly ? "Pet Friendly" : "Tóxica / Cuidado";
        else if (viewMode === "rega") {
          if (plant.intervaloRega <= 3) key = "Frequente (1-3 dias)";
          else if (plant.intervaloRega <= 7) key = "Moderada (4-7 dias)";
          else key = "Espaçada (7+ dias)";
        }
        if (!acc[key]) acc[key] = [];
        acc[key].push(plant);
        return acc;
      }, {})
    : null;

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent shadow-lg shadow-primary-500/20"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={loginGoogle} />;
  }


  return (
    <div className="min-h-screen bg-neutral-50 pb-24 relative overflow-hidden font-body">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-100/20 rounded-full blur-[100px] -z-10"></div>

      {/* Header Fixo */}
      <div className="sticky top-0 z-30 px-4 py-4 animate-slide-down">
        <div className="mx-auto max-w-5xl glass rounded-2xl px-6 py-4 flex items-center justify-between gap-4 shadow-premium border border-white/50">
          <h1 className="text-2xl font-black text-primary-900 flex items-center gap-2 font-heading tracking-tight">
            <span className="drop-shadow-sm">🌱</span> MyPlants
          </h1>

          <div className="relative flex-1 max-w-md group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-primary-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar em seu jardim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-white/50 border border-neutral-100 py-3 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary-100 focus:bg-white focus:border-primary-200 transition-all shadow-sm font-medium"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-6">
        {/* Resumo / Status */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <h2 className="text-3xl font-black text-neutral-900 font-heading tracking-tight">Meu Jardim</h2>
          <div className="text-sm font-bold text-primary-700 bg-primary-100/50 px-4 py-2 rounded-xl shadow-sm border border-primary-200 backdrop-blur-sm">
            {plants.length} {plants.length === 1 ? "planta" : "plantas"}
          </div>
        </div>

        {/* Indicador de Filtros Ativos */}
        {(filterLuz || filterRega || filterPet || filterAtrasada) && (
          <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
            {filterLuz && (
              <span
                onDoubleClick={() => setFilterLuz("")}
                title="Duplo clique para remover"
                className="cursor-pointer hover:scale-105 active:scale-95 transition-all bg-accent-100 text-accent-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-accent-200 shadow-sm flex items-center gap-1"
              >
                ☀️ {filterLuz}
              </span>
            )}
            {filterRega && (
              <span
                onDoubleClick={() => setFilterRega("")}
                title="Duplo clique para remover"
                className="cursor-pointer hover:scale-105 active:scale-95 transition-all bg-secondary-100 text-secondary-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-1"
              >
                💧{" "}
                {filterRega === "cacto"
                  ? "Espaçada"
                  : filterRega === "1gota"
                    ? "Moderada"
                    : "Frequente"}
              </span>
            )}
            {filterPet && (
              <span
                onDoubleClick={() => setFilterPet("")}
                title="Duplo clique para remover"
                className={`cursor-pointer hover:scale-105 active:scale-95 transition-all text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 shadow-sm ${
                  filterPet === "sim"
                    ? "bg-primary-100 text-primary-900 border-primary-200"
                    : "bg-red-100 text-red-900 border-red-200"
                }`}
              >
                {filterPet === "sim" ? "🐶 Pet Friendly" : "🚫 Tóxica"}
              </span>
            )}
            {filterAtrasada && (
              <span
                onDoubleClick={() => setFilterAtrasada(false)}
                title="Duplo clique para remover"
                className="cursor-pointer hover:scale-105 active:scale-95 transition-all bg-red-100 text-red-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 shadow-sm flex items-center gap-1"
              >
                🚨 Precisando de Rega
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-[2rem] bg-neutral-200/50 border border-neutral-100"
              ></div>
            ))}
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FiWind size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nenhuma planta encontrada
            </h3>
            <p className="max-w-xs text-sm text-gray-500">
              Tente ajustar os filtros ou adicione uma nova planta à sua
              coleção.
            </p>
          </div>
        ) : viewMode ? (
          // Visualização Agrupada
          <div className="space-y-12">
            {Object.entries(groupedPlants).map(([groupName, groupPlants]) => (
              <div key={groupName} className="animate-fade-in">
                <h3 className="mb-6 text-xl font-black text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-3 font-heading tracking-tight">
                  <span className="w-2 h-8 bg-primary-500 rounded-full inline-block shadow-sm shadow-primary-500/20"></span>
                  {groupName}
                  <span className="text-xs font-bold text-primary-600 ml-auto bg-primary-100 px-3 py-1 rounded-xl">
                    {groupPlants.length} {groupPlants.length === 1 ? 'item' : 'itens'}
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {groupPlants.map((plant) => (
                    <PlantCard
                      key={plant._id}
                      plant={plant}
                      onClick={setSelectedPlant}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Visualização Padrão (Grid)
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant._id}
                plant={plant}
                onClick={setSelectedPlant}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input de arquivo invisível para o Scan de IA */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAiImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Menu Flutuante */}
      <FloatingMenu
        onAddPlant={() => {
          setPlantToEdit(null);
          setInitialAiData(null);
          setShowAddModal(true);
        }}
        onAddAI={handleAiScan}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={logout}
        filterLuz={filterLuz}
        setFilterLuz={setFilterLuz}
        filterRega={filterRega}
        setFilterRega={setFilterRega}
        filterPet={filterPet}
        setFilterPet={setFilterPet}
        filterAtrasada={filterAtrasada}
        setFilterAtrasada={setFilterAtrasada}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Modais */}
      {showAddModal && (
        <AddPlantModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadPlants();
          }}
          plantToEdit={plantToEdit}
          initialData={initialAiData}
          onDelete={handleDelete}
        />
      )}

      {selectedPlant && (
        <PlantDetailsModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={getSelectedIndex() < filteredPlants.length - 1}
          hasPrev={getSelectedIndex() > 0}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          plants={plants}
          onPlantsUpdate={loadPlants}
        />
      )}

      {/* Overlay de Loading da IA */}
      {aiLoading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-xl font-bold">Analisando imagem...</p>
          <p className="text-sm text-gray-400 mt-2">
            A inteligência artificial está identificando sua planta.
          </p>
        </div>
      )}

      {/* Modal Customizado de Confirmação para Exclusão */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    message: "",
                    onConfirm: null,
                  })
                }
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
