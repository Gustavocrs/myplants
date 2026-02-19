// app/page.js
"use client";

import {useState, useEffect} from "react";
import {useAuth} from "@/context/AuthContext";
import FloatingMenu from "../components/FloatingMenu";
import AddPlantModal from "../components/AddPlantModal";
import {db} from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function Home() {
  const {user, loginGoogle, logout} = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);

  // Escuta as plantas do usuário em tempo real
  useEffect(() => {
    if (!user) return;

    // Cria a query: Plantas do usuário atual, ordenadas pela data de criação
    const q = query(
      collection(db, "plants"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    // onSnapshot cria uma conexão em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plantsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlants(plantsData);
      setLoadingPlants(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
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
          <span className="text-sm text-gray-600">Olá, {user.displayName}</span>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 text-sm font-semibold"
          >
            Sair
          </button>
        </div>
      </header>

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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {plants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={plant.imageUrl}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 truncate">
                    {plant.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingMenu onAddPlant={() => setIsModalOpen(true)} />

      {isModalOpen && <AddPlantModal onClose={() => setIsModalOpen(false)} />}
    </main>
  );
}
