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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section / Header */}
      <div className="relative bg-white pb-16">
        {/* Banner Decorativo */}
        <div className="h-48 w-full bg-gradient-to-r from-green-800 to-emerald-600 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Profile Card Flutuante */}
          <div className="-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 text-center sm:text-left">
            <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl ring-1 ring-gray-100 relative z-10">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl flex items-center justify-center text-3xl font-bold text-green-700 select-none">
                {getInitials(data.profile.displayName)}
              </div>
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {data.profile.displayName}
              </h1>
              <p className="text-green-600 font-medium mt-1">
                Coleção de Plantas
              </p>
            </div>

            <div className="flex gap-3 pb-2 w-full sm:w-auto">
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm active:scale-95"
              >
                <FiShare2 /> Compartilhar
              </button>
            </div>
          </div>

          {/* Search Bar e Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-8">
            <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nesta coleção..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white border focus:border-green-500 rounded-xl transition-all outline-none"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Mostrando{" "}
              <span className="text-gray-900">{filteredPlants?.length}</span> de{" "}
              <span className="text-gray-900">{data.plants.length}</span>{" "}
              plantas
            </div>
          </div>
        </div>
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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🌿
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Nenhuma planta encontrada
            </h3>
            <p className="text-gray-500 mt-1">Tente buscar por outro nome.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-green-600 font-medium hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </main>

      {/* Branding Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <p className="text-sm text-gray-500 mb-2">
            Esta coleção foi criada usando
          </p>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-800 tracking-tight">
            <span className="text-green-600">🌱</span> MyPlants
          </div>
          <a
            href="/"
            className="mt-4 text-xs font-semibold text-green-600 uppercase tracking-wider hover:underline"
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
        />
      )}
    </div>
  );
}
