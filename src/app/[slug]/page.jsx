"use client";

import {useState, useEffect} from "react";
import {useParams} from "next/navigation";
import {api} from "../../services/api";
import PlantCard from "../../components/PlantCard";
import PlantDetailsModal from "../../components/PlantDetailsModal";
import {FiSearch, FiShare2, FiWind} from "react-icons/fi";

export default function PublicProfilePage() {
  const {slug} = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);

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

  // Gera iniciais para o avatar
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

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
      {/* Header Limpo e Orgânico */}
      <header className="bg-white border-b border-stone-100 pt-16 pb-12 px-4 relative overflow-hidden">
        {/* Elementos decorativos de fundo (Blobs) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Avatar Centralizado */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-700 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6 ring-4 ring-white select-none">
            {getInitials(data.profile.displayName)}
          </div>

          {/* Títulos */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 tracking-tight mb-2">
            {data.profile.displayName}
          </h1>
          <p className="text-stone-500 text-lg font-medium mb-8 flex items-center justify-center gap-2">
            <span className="text-green-600">🌿</span> Coleção de Plantas
          </p>

          {/* Barra de Busca e Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch
                  className="text-stone-400 group-focus-within:text-green-600 transition-colors"
                  size={20}
                />
              </div>
              <input
                type="text"
                placeholder="Buscar no jardim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all placeholder:text-stone-400 text-stone-700 shadow-inner"
              />
            </div>
            <button
              onClick={handleShare}
              className="p-3.5 bg-white border border-stone-200 rounded-2xl text-stone-500 hover:bg-stone-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm active:scale-95 shrink-0"
              title="Compartilhar Link"
            >
              <FiShare2 size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Contador Discreto */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-6 flex items-center justify-between">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          Plantas
        </span>
        <span className="bg-white border border-stone-200 text-stone-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {filteredPlants?.length}
        </span>
      </div>

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
          <a
            href="/"
            className="px-6 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-green-100 transition-colors"
          >
            Crie o seu jardim grátis
          </a>
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
