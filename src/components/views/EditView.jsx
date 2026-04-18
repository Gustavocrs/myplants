"use client";

import { useEffect, useRef, useState } from "react";
import { FiTrash2, FiZap, FiRotateCw, FiImage } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { fixImageOrientation as fixOrientation } from "@/lib/imageOrientation";
import Image from "next/image";

export default function EditView({
  plant: initialPlant,
  plantId,
  onClose,
  onSave,
  onDelete,
}) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [plant, setPlant] = useState(initialPlant || null);
  const [loading, setLoading] = useState(!initialPlant);
  const [formData, setFormData] = useState({
    nome: "",
    nomeCientifico: "",
    luz: "Meia-sombra",
    intervaloRega: 7,
    petFriendly: false,
    observacoes: "",
  });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imagemUrl, setImagemUrl] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!hasLoaded && initialPlant) {
      setPlant(initialPlant);
      setFormData({
        nome: initialPlant.nome || "",
        nomeCientifico: initialPlant.nomeCientifico || "",
        luz: initialPlant.luz || "Meia-sombra",
        intervaloRega: initialPlant.intervaloRega || 7,
        petFriendly: initialPlant.petFriendly || false,
        observacoes: initialPlant.observacoes || "",
      });
      setImagemUrl(initialPlant.imagemUrl || "");
      setLoading(false);
      setHasLoaded(true);
    }
  }, [initialPlant, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded && plantId) {
      loadPlant();
    }
  }, [plantId, hasLoaded]);

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
      });
      setImagemUrl(data.imagemUrl || "");
      setHasLoaded(true);
    } catch (err) {
      console.error("Erro ao carregar planta:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = async () => {
    try {
      const currentImage = imagemUrl || plant.imagemUrl;
      if (!currentImage) return;
      
      let file;
      if (currentImage.startsWith("data:")) {
        const arr = currentImage.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        file = new File([u8arr], "plant.jpg", { type: mime });
      } else {
        const response = await fetch(currentImage);
        const blob = await response.blob();
        file = new File([blob], "plant.jpg", { type: "image/jpeg" });
      }
      
      const rotatedFile = await applyRealRotation(file, 90);
      const reader = new FileReader();
      reader.readAsDataURL(rotatedFile);
      reader.onload = (e) => {
        setImagemUrl(e.target.result);
      };
    } catch (err) {
      console.error("Erro ao rotacionar:", err);
    }
  };

  const applyRealRotation = async (file, degrees) => {
    const arrayBuffer = await file.arrayBuffer();
    const imageBlob = new Blob([arrayBuffer], { type: file.type });
    const objectUrl = URL.createObjectURL(imageBlob);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        let width = img.width;
        let height = img.height;
        
        if (degrees === 90 || degrees === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (degrees === 90) {
          ctx.translate(canvas.width, 0);
          ctx.rotate(Math.PI / 2);
        } else if (degrees === 180) {
          ctx.translate(canvas.width, canvas.height);
          ctx.rotate(Math.PI);
        } else if (degrees === 270) {
          ctx.translate(0, canvas.height);
          ctx.rotate(-Math.PI / 2);
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        }, "image/jpeg", 0.9);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  const handleRemoveImage = () => {
    setImagemUrl("");
    setRotation(0);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fixedFile = await fixOrientation(file);
    const reader = new FileReader();
    reader.readAsDataURL(fixedFile);
    reader.onload = (event) => {
      setImagemUrl(event.target.result);
      setRotation(0);
    };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave = { ...formData };
      if (imagemUrl !== (initialPlant?.imagemUrl || "")) {
        dataToSave.imagemUrl = imagemUrl;
      }
      const updated = await api.updatePlant(plant._id, dataToSave);
      setPlant(updated);
      onSave();
      showSuccess("Planta atualizada!");
      onClose();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!imagemUrl && !plant.imagemUrl) return;
    setAiLoading(true);
    try {
      const currentImage = imagemUrl || plant.imagemUrl;
      let payload = currentImage;
      if (currentImage.startsWith("data:")) {
        const arr = currentImage.split(",");
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
        onSave();
        showSuccess("Planta atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro IA:", error);
      showError(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePlant(plant._id);
      onDelete();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/2 lg:w-2/5 h-[35vh] md:h-full relative shrink-0 bg-neutral-900">
        {imagemUrl ? (
          <>
            <Image
              src={imagemUrl}
              alt={plant.nome}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            {/* Botões de controle da imagem */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleRotate}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                title="Girar 90°"
              >
                <FiRotateCw size={20} />
              </button>
              <button
                onClick={handleRemoveImage}
                className="w-10 h-10 bg-red-500/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all"
                title="Remover foto"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            <FiImage size={48} />
            <span className="mt-2 text-sm font-medium">Adicionar foto</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-900/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight drop-shadow-lg">
            Editando
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-500 font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="flex-1 p-4 md:p-12 overflow-y-auto pb-28">
          <div className="max-w-2xl mx-auto space-y-6">
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
                    setFormData({ ...formData, intervaloRega: e.target.value })
                  }
                  className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-2xl px-4 py-4 text-sm font-bold"
                />
              </div>
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
                onClick={handleDeleteClick}
                className="py-4 px-5 bg-red-50 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
                onClick={handleDelete}
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
