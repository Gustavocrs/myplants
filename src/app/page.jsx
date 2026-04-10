"use client";

import heic2any from "heic2any";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiFilter,
  FiLogOut,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSun,
  FiWind,
} from "react-icons/fi";
import FloatingMenu from "../components/FloatingMenu";
import LandingPage from "../components/landing/LandingPage";
import PlantCard from "../components/PlantCard";
import AddView from "../components/views/AddView";
import DetailView from "../components/views/DetailView";
import EditView from "../components/views/EditView";
import SettingsView from "../components/views/SettingsView";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";

export default function Home() {
  const { user, loading: authLoading, logout, loginGoogle } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const searchParams = useSearchParams();

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  // Search
  const [searchTerm, setSearchTerm] = useState("");

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

  // Sistema de navegação (injeção de views)
  const [activeView, setActiveView] = useState("list"); // list|detail|add|edit|settings
  const [activePlantId, setActivePlantId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const scrollYRef = useRef(0);
  const isNavigatingRef = useRef(false);

  // Sincronizar estado inicial da URL
  useEffect(() => {
    const v = searchParams.get("v");
    const id = searchParams.get("id");
    const edit = searchParams.get("edit");

    if (v && v !== "list") {
      setActiveView(v);
      if (id) setActivePlantId(id);
      setIsEditing(edit === "true");
    } else {
      setActiveView("list");
      setActivePlantId(null);
      setIsEditing(false);
    }
  }, [searchParams]);

  // Hook de ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && activeView !== "list") {
        closeView(true);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [activeView]);

  // Hook de popstate (botão voltar do navegador)
  useEffect(() => {
    const handlePopstate = (e) => {
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      const url = new URL(window.location.href);
      const v = url.searchParams.get("v");
      const id = url.searchParams.get("id");

      if (!v || v === "list") {
        setActiveView("list");
        setActivePlantId(null);
        setIsEditing(false);
        window.scrollTo(0, scrollYRef.current);
      } else {
        setActiveView(v);
        setActivePlantId(id || null);
        setIsEditing(url.searchParams.get("edit") === "true");
      }
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  // Travar scroll quando view estiver ativa
  useEffect(() => {
    if (activeView !== "list") {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [activeView]);

  const openView = (view, options = {}) => {
    const {
      id = null,
      edit = false,
      aiData = null,
      pushState = true,
    } = options;

    setActiveView(view);
    setActivePlantId(id);
    setIsEditing(edit);
    if (aiData) setInitialAiData(aiData);

    if (pushState) {
      isNavigatingRef.current = true;
      const url = new URL(window.location.href);
      if (view === "list") {
        url.searchParams.delete("v");
        url.searchParams.delete("id");
        url.searchParams.delete("edit");
      } else {
        url.searchParams.set("v", view);
        if (id) url.searchParams.set("id", id);
        if (edit) url.searchParams.set("edit", "true");
        else url.searchParams.delete("edit");
      }
      window.history.pushState({}, "", url);
    }
  };

  const closeView = (fromEsc = false) => {
    if (activeView === "list") return;

    setActiveView("list");
    setActivePlantId(null);
    setIsEditing(false);
    setInitialAiData(null);

    isNavigatingRef.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("v");
    url.searchParams.delete("id");
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url);

    setTimeout(() => {
      window.scrollTo(0, scrollYRef.current);
    }, 10);
  };

  useEffect(() => {
    if (!authLoading && user && activeView === "list") {
      loadPlants();
    }
  }, [user, authLoading, activeView]);

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
    openView("detail", { id: plant._id, edit: true });
  };

  const handleDetail = (plant) => {
    openView("detail", { id: plant._id });
  };

  const handleAiAnalyze = async (plant) => {
    if (!plant.imagemUrl) return;
    setAiLoading(true);
    try {
      let payload = plant.imagemUrl;
      if (plant.imagemUrl.startsWith("data:")) {
        const arr = plant.imagemUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        payload = new File([u8arr], "plant.jpg", { type: mime });
      }
      const data = await api.identifyPlant(payload, user.uid, plant.nome);
      if (data) {
        const updated = await api.updatePlant(plant._id, data);
        setSelectedPlant(updated);
        loadPlants();
      }
    } catch (error) {
      console.error("Erro IA:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePlant(id);
      setSelectedPlant(null);
      loadPlants();
    } catch (error) {
      alert("Erro ao excluir planta");
    }
  };

  const handleDeleteFromView = async () => {
    if (!activePlantId) return;
    try {
      await api.deletePlant(activePlantId);
      closeView();
      loadPlants();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleQuickWater = async (id) => {
    try {
      setLoading(true);
      await api.updatePlant(id, {
        ultimaRega: new Date().toISOString(),
        notificationSent: false,
      });
      await loadPlants();
    } catch (error) {
      console.error("Erro ao regar planta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiScan = () => {
    fileInputRef.current?.click();
  };

  const handleAiImageSelect = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "heic" || ext === "heif") {
      try {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.85,
        });
        file = new File([converted], file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
        });
      } catch (err) {
        console.error("Erro ao converter HEIC:", err);
        return;
      }
    }

    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        const base64 = event.target.result;
        openView("add", { aiData: { imagemUrl: base64 } });
        setAiLoading(false);
      };
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      setAiLoading(false);
    }
  };

  const handleSavePlant = async () => {
    closeView();
    await loadPlants();
  };

  const handleUpdatePlant = async () => {
    await loadPlants();
  };

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
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent shadow-premium"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={loginGoogle} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-32 relative overflow-hidden font-body text-neutral-900 dark:text-neutral-100">
      {/* Background Ornaments - Design Skill Premium */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 dark:bg-primary-900/10 rounded-full blur-[120px] -z-10 animate-float"></div>
      <div
        className="absolute top-[40%] left-[-100px] w-[400px] h-[400px] bg-accent-200/10 dark:bg-accent-900/10 rounded-full blur-[100px] -z-10 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Header Fixo - Glassmorphism */}
      <nav className="sticky top-0 z-40 px-4 py-4 sm:px-6 animate-fade-in">
        <div className="mx-auto max-w-6xl glass dark:bg-neutral-900/60 rounded-3xl px-5 py-3.5 flex items-center justify-between gap-6 shadow-premium border border-white/40 dark:border-neutral-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-xl">🌱</span>
            </div>
            <h1 className="text-xl font-bold font-heading tracking-tight hidden sm:block">
              MyPlants
            </h1>
          </div>

          <div className="relative flex-1 max-w-lg group">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors duration-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar em seu jardim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-neutral-100/50 dark:bg-neutral-800/50 border-none py-3 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:bg-white dark:focus:bg-neutral-800 transition-all duration-300 font-medium"
            />
          </div>

          <button
            onClick={toggleTheme}
            disabled={!mounted}
            className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {mounted &&
              (theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />)}
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero Section / Greeting */}
        <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black font-heading tracking-tighter">
              Seu{" "}
              <span className="text-primary-600 dark:text-primary-400">
                Jardim
              </span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
              Acompanhe e cuide das suas {plants.length} plantas com auxílio de
              IA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAiScan}
              className="px-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="text-lg">🤖</span> Scan IA
            </button>
            <button
              onClick={() => openView("add")}
              className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/40 transition-all flex items-center gap-2 active:scale-95"
            >
              <FiPlus size={20} /> Nova Planta
            </button>
          </div>
        </section>

        {/* Filtros Ativos Label */}
        {(filterLuz || filterRega || filterPet || filterAtrasada) && (
          <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
            <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-2 mr-2">
              <FiFilter /> Filtros:
            </span>
            {filterLuz && (
              <button
                onClick={() => setFilterLuz("")}
                className="bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-[11px] font-bold px-4 py-2 rounded-xl border border-accent-200 dark:border-accent-800 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all flex items-center gap-2"
              >
                ☀️ {filterLuz} ✕
              </button>
            )}
            {/* Outros filtros seguem o mesmo padrão premium... */}
          </div>
        )}

        {/* Conteúdo Principal */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-[2.5rem] bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
              ></div>
            ))}
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in bg-white dark:bg-neutral-900/40 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
              <FiWind size={40} className="animate-float" />
            </div>
            <h3 className="text-2xl font-bold font-heading">
              Seu jardim está tranquilo demais...
            </h3>
            <p className="max-w-xs text-neutral-500 mt-2 font-medium">
              Adicione sua primeira planta ou ajuste os filtros para ver seus
              resultados.
            </p>
            <button
              onClick={() => openView("add")}
              className="mt-8 px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-bold text-sm transition-all hover:scale-105"
            >
              Começar Coleção
            </button>
          </div>
        ) : viewMode ? (
          <div className="space-y-16">
            {Object.entries(groupedPlants).map(([groupName, groupPlants]) => (
              <div key={groupName} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-1.5 bg-primary-500 rounded-full"></div>
                  <h3 className="text-2xl font-black font-heading tracking-tight">
                    {groupName}
                  </h3>
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-bold text-neutral-500">
                    {groupPlants.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {groupPlants.map((plant) => (
                    <PlantCard
                      key={plant._id}
                      plant={plant}
                      onClick={(p) => handleDetail(p)}
                      onEdit={(p) =>
                        openView("detail", { id: p._id, edit: true })
                      }
                      onWater={handleQuickWater}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant._id}
                plant={plant}
                onClick={(p) => handleDetail(p)}
                onEdit={(p) => openView("detail", { id: p._id, edit: true })}
                onWater={handleQuickWater}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating UI Elements */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAiImageSelect}
        accept="image/*,.heic,.heif"
        capture="environment"
        className="hidden"
      />

      <FloatingMenu
        onAddPlant={() => openView("add")}
        onAddAI={handleAiScan}
        onOpenSettings={() => openView("settings")}
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

      {/* Injected Views */}
      {activeView === "detail" && activePlantId && (
        <DetailView
          plantId={activePlantId}
          isEditing={isEditing}
          onClose={closeView}
          onEdit={(edit = true) =>
            openView("detail", { id: activePlantId, edit })
          }
          onDelete={handleDeleteFromView}
          onUpdate={handleUpdatePlant}
          plants={plants}
          onNavigate={(id) => openView("detail", { id })}
        />
      )}

      {activeView === "add" && (
        <AddView
          initialData={initialAiData}
          onClose={closeView}
          onSave={handleSavePlant}
        />
      )}

      {activeView === "edit" && activePlantId && (
        <EditView
          plantId={activePlantId}
          onClose={() => openView("detail", { id: activePlantId })}
          onSave={handleUpdatePlant}
          onDelete={handleDeleteFromView}
        />
      )}

      {activeView === "settings" && (
        <SettingsView
          onClose={closeView}
          plants={plants}
          onUpdatePlants={loadPlants}
        />
      )}

      {/* AI Loading - Premium */}
      {aiLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-md text-white px-6 text-center">
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
              🤖
            </span>
          </div>
          <h2 className="text-3xl font-black font-heading mb-2">
            Visão Computacional
          </h2>
          <p className="max-w-xs text-neutral-400 font-medium">
            Extraindo segredos botânicos da sua imagem...
          </p>
        </div>
      )}

      {/* Confirmação de Exclusão - Design System Refinado */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300 border border-neutral-100 dark:border-neutral-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mb-6 text-2xl">
              ⚠️
            </div>
            <h3 className="text-2xl font-black font-heading tracking-tight mb-2">
              Excluir Planta?
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium leading-relaxed">
              Esta ação é permanente e os dados de cuidado serão perdidos.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    message: "",
                    onConfirm: null,
                  })
                }
                className="py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-2xl font-bold transition-all hover:bg-neutral-200"
              >
                Voltar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
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
