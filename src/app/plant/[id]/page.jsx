"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiDroplet,
  FiSave,
  FiShield,
  FiSun,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const plantId = params.id;

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (plantId) {
      loadPlant();
    }
  }, [plantId]);

  const loadPlant = async () => {
    try {
      setLoading(true);
      const data = await api.getPlant(plantId);
      setPlant(data);
      setFormData({
        nome: data.nome || "",
        nomeCientifico: data.nomeCientifico || "",
        luz: data.luz || "Meia-sombra",
        intervaloRega: data.intervaloRega || 7,
        petFriendly: data.petFriendly || false,
        observacoes: data.observacoes || "",
        ultimaRega: data.ultimaRega
          ? new Date(data.ultimaRega).toISOString().split("T")[0]
          : "",
      });
    } catch (err) {
      console.error("Erro ao carregar planta:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await api.updatePlant(plant._id, formData);
      setPlant(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePlant(plant._id);
      router.push("/");
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 animate-spin rounded-full" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <FiX size={40} className="text-neutral-400" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-4">
            Ops!
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">
            Esta planta não foi encontrada ou pode ter sido removida.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all"
          >
            Voltar ao Jardim
          </button>
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      id: "luz",
      label: "Luminosidade",
      val: plant.luz || "Não informado",
      icon: <FiSun />,
      color:
        "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
    },
    {
      id: "rega",
      label: "Ciclo de Rega",
      val: `Cada ${plant.intervaloRega} dias`,
      icon: <FiDroplet />,
      color:
        "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    },
    {
      id: "data",
      label: "No Jardim desde",
      val: plant.dataAquisicao
        ? new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")
        : "Recém chegada",
      icon: <FiCalendar />,
      color:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
    },
    {
      id: "pet",
      label: "Segurança",
      val: plant.petFriendly ? "Pet Friendly" : "Planta Tóxica",
      icon: <FiShield />,
      color: plant.petFriendly
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col md:flex-row">
      {/* Left - Image */}
      <div className="w-full md:w-1/2 lg:w-2/5 h-[50vh] md:h-screen relative">
        <img
          src={plant.imagemUrl}
          alt={plant.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 w-12 h-12 bg-white/80 dark:bg-neutral-800/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
        >
          <FiX size={24} />
        </button>

        {user && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 z-20 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        )}

        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-4xl font-black text-white font-heading tracking-tighter">
            {plant.nome}
          </h1>
          {plant.nomeCientifico && (
            <p className="text-white/80 italic font-medium mt-1">
              {plant.nomeCientifico}
            </p>
          )}
        </div>
      </div>

      {/* Right - Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {isEditing ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="inline-block px-4 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-xs font-black uppercase rounded-full">
              Editando
            </span>

            <div className="space-y-4">
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full text-4xl font-black bg-transparent border-b-2 border-primary-500"
              />
              <input
                type="text"
                value={formData.nomeCientifico}
                onChange={(e) =>
                  setFormData({ ...formData, nomeCientifico: e.target.value })
                }
                placeholder="Nome científico"
                className="w-full text-lg italic bg-transparent border-b border-neutral-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.luz}
                onChange={(e) =>
                  setFormData({ ...formData, luz: e.target.value })
                }
                className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-3"
              >
                <option>Sombra</option>
                <option>Meia-sombra</option>
                <option>Luz Difusa</option>
                <option>Sol Pleno</option>
              </select>
              <input
                type="number"
                value={formData.intervaloRega}
                onChange={(e) =>
                  setFormData({ ...formData, intervaloRega: e.target.value })
                }
                className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-3"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
              <input
                type="checkbox"
                checked={formData.petFriendly}
                onChange={(e) =>
                  setFormData({ ...formData, petFriendly: e.target.checked })
                }
                className="w-5 h-5"
              />
              <label>Pet Friendly</label>
            </div>

            <textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              rows={4}
              className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-3"
              placeholder="Observações..."
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 bg-neutral-200 dark:bg-neutral-700 rounded-2xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <span className="inline-block px-4 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-xs font-black uppercase tracking-widest rounded-full mb-6">
              Detalhes
            </span>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {infoItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
                >
                  <div
                    className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-lg mb-4`}
                  >
                    {item.icon}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {item.val}
                  </p>
                </div>
              ))}
            </div>

            {plant.observacoes && (
              <div className="relative p-6 rounded-[2rem] bg-primary-50/30 dark:bg-primary-900/10 border border-primary-100">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary-600 text-white text-xs font-black uppercase rounded-lg">
                  Diário
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {plant.observacoes}
                </p>
              </div>
            )}

            <div className="mt-10 pt-10 flex items-center justify-between">
              <div className="text-neutral-300">
                <p className="text-[9px] font-black uppercase">ID</p>
                <p className="text-xs font-mono">
                  {plant._id?.substring(0, 8)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] max-w-sm w-full">
            <h3 className="text-xl font-black mb-4">Excluir?</h3>
            <p className="text-neutral-600 mb-6">Não pode ser desfeito.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-neutral-200 rounded-2xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold"
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
