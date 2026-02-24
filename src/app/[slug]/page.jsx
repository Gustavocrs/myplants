"use client";

import {useState, useEffect} from "react";
import {api} from "../../services/api";
import PlantCard from "../../components/PlantCard";
import PlantDetailsModal from "../../components/PlantDetailsModal";
import Link from "next/link";

export default function PublicProfile({params}) {
  const {slug} = params;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plantToView, setPlantToView] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getPublicProfile(slug);
        // Normaliza os dados das plantas como feito na home
        const formattedPlants = data.plants.map((p) => ({
          ...p,
          id: p._id,
          name: p.nome || p.name,
          imageUrl: p.imagemUrl || p.imageUrl,
        }));

        setProfileData({
          ...data.profile,
          plants: formattedPlants,
        });
      } catch (err) {
        setError("Perfil não encontrado ou privado.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-4xl mb-4">🥀</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="text-green-600 hover:underline font-medium">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Header Público */}
      <div className="bg-green-700 text-white py-12 px-4 mb-8 shadow-lg">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {profileData.displayName}
          </h1>
          <p className="text-green-100">
            Coleção de Plantas • {profileData.plants.length} espécies
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {profileData.plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onClick={(p) => setPlantToView(p)}
              // Não passamos onEdit, então o botão de editar não aparecerá
            />
          ))}
        </div>
      </div>

      {plantToView && (
        <PlantDetailsModal
          plant={plantToView}
          onClose={() => setPlantToView(null)}
        />
      )}

      <footer className="mt-16 text-center text-gray-500 text-sm pb-8">
        <p>
          Desenvolvido com 💚 no{" "}
          <Link href="/" className="font-bold hover:text-green-600">
            MyPlants
          </Link>
        </p>
      </footer>
    </main>
  );
}
