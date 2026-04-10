"use client";

import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiShield,
  FiSun,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function DetailView({
  plantId,
  isEditing,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
  plants,
  onNavigate,
}) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const mapPlantToFormData = (data) => ({
    nome: data?.nome || "",
    nomeCientifico: data?.nomeCientifico || "",
    luz: data?.luz || "Meia-sombra",
    intervaloRega: data?.intervaloRega || 7,
    petFriendly: data?.petFriendly || false,
    observacoes: data?.observacoes || "",
  });

  useEffect(() => {
    if (plantId) loadPlant();
  }, [plantId]);

  const loadPlant = async () => {
    try {
      setLoading(true);
      const data = await api.getPlant(plantId);
      setPlant(data);
      setFormData(mapPlantToFormData(data));
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
      setFormData(mapPlantToFormData(updated));
      onUpdate();
      showSuccess("Planta atualizada!");
      onEdit(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiAnalyze = async () => {
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
        setPlant(updated);
        setFormData(mapPlantToFormData(updated));
        onUpdate();
        showSuccess("Planta atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro IA:", error);
      showError(error);
    } finally {
      setAiLoading(false);
    }
  };

  const currentIndex = plants.findIndex((p) => p._id === plantId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < plants.length - 1;

  const goToPrev = () => {
    if (hasPrev) onNavigate(plants[currentIndex - 1]._id);
  };

  const goToNext = () => {
    if (hasNext) onNavigate(plants[currentIndex + 1]._id);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 animate-spin rounded-full" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-xl font-bold dark:text-white">
            Planta não encontrada
          </h3>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl"
          >
            Voltar
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
    <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex flex-col md:flex-row overflow-hidden">
      {/* Left - Image */}
      <div className="w-full md:w-1/2 lg:w-2/5 h-[35vh] md:h-full relative shrink-0">
        <img
          src={plant.imagemUrl}
          alt={plant.nome}
          className="w-full h-full object-cover"
        />

        {/* Mobile: Top buttons overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between md:hidden">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white/95 backdrop-blur-sm text-neutral-700 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <FiX size={22} />
          </button>
          {user && !isEditing && (
            <button
              onClick={onEdit}
              className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-900/30 to-transparent" />
        <div className="pointer-events-none absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
          <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight drop-shadow-lg">
            {plant.nome}
          </h1>
          {plant.nomeCientifico && (
            <p className="text-white/70 italic font-medium mt-1 text-sm md:text-base">
              {plant.nomeCientifico}
            </p>
          )}
        </div>
      </div>

      {/* Right - Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Actions - Desktop only */}
        <div className="hidden md:flex items-center justify-end gap-3 p-4 border-b border-neutral-100 dark:border-neutral-800">
          {user && !isEditing && (
            <button
              onClick={onEdit}
              className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"
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
          <button
            onClick={onClose}
            className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Desktop: Carousel Navigation in middle */}
        {plants.length > 1 && (
          <div className="hidden md:flex items-center justify-center gap-4 py-3 border-b border-neutral-50 dark:border-neutral-800">
            <button
              onClick={goToPrev}
              disabled={!hasPrev}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${hasPrev ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:scale-110" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300"}`}
            >
              <FiChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold text-neutral-400">
              {currentIndex + 1} / {plants.length}
            </span>
            <button
              onClick={goToNext}
              disabled={!hasNext}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${hasNext ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:scale-110" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300"}`}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 p-4 md:p-12 overflow-y-auto pb-28 md:pb-12">
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
                  className="w-full text-2xl md:text-4xl font-black bg-transparent border-b-2 border-primary-500 py-2 dark:text-white"
                  placeholder="Nome da planta"
                />
                <input
                  type="text"
                  value={formData.nomeCientifico}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeCientifico: e.target.value })
                  }
                  placeholder="Nome científico"
                  className="w-full text-base md:text-lg italic bg-transparent border-b border-neutral-300 py-2 dark:text-neutral-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Luminosidade
                  </label>
                  <select
                    value={formData.luz}
                    onChange={(e) =>
                      setFormData({ ...formData, luz: e.target.value })
                    }
                    className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-4 text-sm font-bold"
                  >
                    <option>Sombra</option>
                    <option>Meia-sombra</option>
                    <option>Luz Difusa</option>
                    <option>Sol Pleno</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Ciclo de Rega (dias)
                  </label>
                  <input
                    type="number"
                    value={formData.intervaloRega}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intervaloRega: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-4 text-sm font-bold"
                  />
                </div>
                {(() => {
                  const proximaRega = plant.ultimaRega
                    ? (() => {
                        const last = new Date(plant.ultimaRega);
                        last.setDate(
                          last.getDate() + Number(formData.intervaloRega || 0),
                        );
                        return last.toISOString().split("T")[0];
                      })()
                    : null;
                  return (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                        Próxima Rega
                      </label>
                      <input
                        type="date"
                        value={proximaRega || ""}
                        disabled
                        className="w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl px-4 py-4 text-sm font-bold text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                      />
                    </div>
                  );
                })()}
              </div>

              <label className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.petFriendly}
                  onChange={(e) =>
                    setFormData({ ...formData, petFriendly: e.target.checked })
                  }
                  className="w-6 h-6 rounded-lg text-primary-600"
                />
                <span className="text-sm font-bold dark:text-white">
                  Pet Friendly
                </span>
              </label>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-4 text-sm"
                  placeholder="Cuidados especiais..."
                />
              </div>

              {/* Botões de ação - apenas no modo edição */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => onEdit(false)}
                  className="flex-1 py-4 bg-neutral-200 dark:bg-neutral-700 rounded-2xl font-bold dark:text-white"
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

              {plant.imagemUrl && user && (
                <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={handleAiAnalyze}
                    disabled={aiLoading}
                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    {aiLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                      <>
                        <FiZap /> Avaliar com IA
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="py-4 px-5 bg-red-50 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              )}
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
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Bottom fixed pagination */}
      {plants.length > 1 && (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl border border-neutral-100 dark:border-neutral-800 z-50">
          <button
            onClick={goToPrev}
            disabled={!hasPrev}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${hasPrev ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 active:scale-90" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300"}`}
          >
            <FiChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300 min-w-[40px] text-center">
            {currentIndex + 1}/{plants.length}
          </span>
          <button
            onClick={goToNext}
            disabled={!hasNext}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${hasNext ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 active:scale-90" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300"}`}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-4 dark:text-white">
              Excluir?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Não pode ser desfeito.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 bg-neutral-200 dark:bg-neutral-700 rounded-2xl font-bold dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold"
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
