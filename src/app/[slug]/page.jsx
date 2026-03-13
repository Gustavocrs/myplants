"use client";

import {useState, useEffect, useRef} from "react";
import {useParams} from "next/navigation";
import {api} from "../../services/api";
import PlantCard from "../../components/PlantCard";
import PlantDetailsModal from "../../components/PlantDetailsModal";
import {FiSearch, FiShare2, FiWind, FiX} from "react-icons/fi";

export default function PublicProfilePage() {
  const {slug} = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (slug) {
      loadProfile();
    }
  }, [slug]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await api.getPublicProfile(slug);
      setData(result);
    } catch (err) {
      setError("Perfil não encontrado ou privado.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Jardim de ${data?.profile?.displayName}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  // Filtra as plantas localmente
  const filteredPlants = data?.plants?.filter((plant) =>
    plant.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getFirstName = (name) => {
    return name?.split(" ")[0] || "";
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Navegação do Modal (Vitrine)
  const getSelectedIndex = () => {
    if (!selectedPlant || !filteredPlants) return -1;
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPlant, filteredPlants]); // Atualiza listeners quando a planta ou a lista mudam

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Carregando o jardim...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
          <FiWind size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <a
          href="/"
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Ir para a Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-800 font-sans pb-20">
      {/* Header Dividido */}
      <header className="flex flex-col md:flex-row h-auto md:h-24 shadow-sm relative z-10 bg-white">
        {/* Coluna 1 - Logo (Verde) */}
        <div className="w-full md:w-1/4 bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center p-4 text-white relative overflow-hidden">
          <a
            href="/"
            className="flex flex-row items-center justify-center h-full w-full hover:scale-105 transition-transform duration-300 gap-2"
          >
            {/* Logo ocupando aproximadamente 70% da altura do container */}
            <span className="text-4xl md:text-5xl leading-none drop-shadow-md">
              🌱
            </span>
            <span className="text-lg md:text-xl font-bold tracking-tight drop-shadow-sm">
              MyPlants
            </span>
          </a>
        </div>

        {/* Coluna 2 - Info (Branca) */}
        <div className="w-full md:w-2/4 bg-white p-4 md:px-8 flex flex-col justify-center items-center md:items-start text-center md:text-left border-b border-stone-100 md:border-none">
          <h1 className="text-xl md:text-2xl font-extrabold text-stone-800 tracking-tight">
            Jardim Digital de{" "}
            <span className="text-green-700">
              {getFirstName(data.profile.displayName)}
            </span>
          </h1>
          <p className="text-stone-500 text-xs md:text-sm font-medium mt-1">
            Conheça as plantas que cultivo
          </p>
        </div>

        {/* Coluna 3 - Ações (Branca) */}
        <div className="w-full md:w-1/4 bg-white p-4 flex items-center justify-center md:justify-end gap-3 md:pr-8">
          {/* Busca Expansível */}
          <div
            className={`relative flex items-center transition-all duration-300 ease-in-out ${
              isSearchOpen ? "w-full md:w-64" : "w-10"
            }`}
          >
            {isSearchOpen ? (
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-4 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                  onBlur={() => !searchTerm && setIsSearchOpen(false)}
                />
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-green-600 hover:bg-stone-50 rounded-full transition-colors"
                title="Buscar"
              >
                <FiSearch size={20} />
              </button>
            )}
          </div>

          {/* Botão Compartilhar */}
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-green-600 hover:bg-stone-50 rounded-full transition-colors"
            title="Compartilhar"
          >
            <FiShare2 size={20} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPlants?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredPlants.map((plant) => (
              <div
                key={plant._id}
                className="transform transition-all duration-300 hover:-translate-y-1"
              >
                <PlantCard
                  plant={plant}
                  onClick={setSelectedPlant}
                  // No public profile, we generally don't show edit buttons
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
              <FiWind size={32} />
            </div>
            <h3 className="text-lg font-medium text-stone-800">
              Nenhuma planta encontrada nesta busca
            </h3>
            <p className="text-stone-500 mt-1 max-w-xs">
              Tente buscar por outro nome ou limpe o filtro para ver o jardim
              completo.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors text-sm font-medium"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </main>

      {/* Branding Footer */}
      <footer className="border-t border-stone-200 bg-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <p className="text-sm text-stone-500 mb-3">
            Jardim digital cultivado no
          </p>
          <div className="flex items-center gap-2 text-xl font-bold text-stone-800 tracking-tight mb-4">
            <span className="text-green-600 text-2xl">🌱</span> MyPlants
          </div>
          {/* <a
            href="/"
            className="px-6 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-green-100 transition-colors"
          >
            Crie o seu jardim grátis
          </a> */}
        </div>
      </footer>

      {/* Modal de Detalhes */}
      {selectedPlant && (
        <PlantDetailsModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          isPublicView={true}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={getSelectedIndex() < (filteredPlants?.length || 0) - 1}
          hasPrev={getSelectedIndex() > 0}
        />
      )}
    </div>
  );
}
