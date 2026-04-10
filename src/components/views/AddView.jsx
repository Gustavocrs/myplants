"use client";

import heic2any from "heic2any";
import { useRef, useState } from "react";
import { FiCamera, FiDroplet, FiSun, FiX, FiZap } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function AddView({ initialData, onClose, onSave }) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [nome, setNome] = useState(initialData?.nome || "");
  const [nomeCientifico, setNomeCientifico] = useState("");
  const [luz, setLuz] = useState("Meia-sombra");
  const [intervaloRega, setIntervaloRega] = useState(7);
  const [petFriendly, setPetFriendly] = useState(false);
  const [dataAquisicao, setDataAquisicao] = useState("");
  const [ultimaRega, setUltimaRega] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [proximaRega, setProximaRega] = useState("");
  const [lembretesAtivos, setLembretesAtivos] = useState(true);
  const [observacoes, setObservacoes] = useState("");
  const [imagemUrl, setImagemUrl] = useState(initialData?.imagemUrl || null);
  const [preview, setPreview] = useState(initialData?.imagemUrl || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleProximaRegaChange = (e) => {
    const newNextDate = e.target.value;
    setProximaRega(newNextDate);
    if (newNextDate && intervaloRega) {
      const next = new Date(newNextDate);
      const last = new Date(
        next.getTime() - Number(intervaloRega) * 24 * 60 * 60 * 1000,
      );
      setUltimaRega(last.toISOString().split("T")[0]);
    }
  };

  const handleImageChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "heic" || ext === "heif") {
      try {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        file = new File([converted], file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
        });
      } catch (err) {
        console.error("Erro HEIC:", err);
        return;
      }
    }
    compressImage(file);
  };

  const compressImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setImagemUrl(dataUrl);
        setPreview(dataUrl);
      };
    };
  };

  const handleAiFill = async () => {
    if (!imagemUrl) return;
    setLoading(true);
    try {
      let payload = imagemUrl;
      if (imagemUrl.startsWith("data:")) {
        const arr = imagemUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        payload = new File([u8arr], "plant.jpg", { type: mime });
      }
      const data = await api.identifyPlant(payload, user.uid, nome);
      if (data.nome) setNome(data.nome);
      if (data.nomeCientifico) setNomeCientifico(data.nomeCientifico);
      if (data.luz) setLuz(data.luz);
      if (data.intervaloRega) setIntervaloRega(data.intervaloRega);
      setPetFriendly(!!data.petFriendly);
      if (data.observacoes) setObservacoes(data.observacoes);
      showSuccess("Planta identificada com sucesso!");
    } catch (error) {
      console.error("Erro IA:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome || !imagemUrl) return;
    setLoading(true);
    try {
      const plantData = {
        nome,
        nomeCientifico,
        luz,
        intervaloRega: Number(intervaloRega),
        petFriendly,
        lembretesAtivos,
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
        ultimaRega: ultimaRega ? new Date(ultimaRega) : null,
        notificationSent: false,
        observacoes,
        imagemUrl,
        userId: user.uid,
        userEmail: user.email,
      };
      await api.createPlant(plantData);
      showSuccess("Planta cadastrada!");
      onSave();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex flex-col md:flex-row overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5 w-full max-h-screen">
        {/* Left Column */}
        <div className="md:col-span-2 bg-neutral-50 dark:bg-neutral-900/20 p-4 md:p-6 border-r border-neutral-100 dark:border-neutral-800/50 flex flex-col gap-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black font-heading tracking-tight dark:text-white">
              Cultivar
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
            >
              <FiX size={20} />
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/5] bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all group overflow-hidden relative shadow-sm"
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white text-primary-600 px-4 py-2 rounded-xl font-bold text-xs shadow-xl">
                    Trocar Foto
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center px-4">
                <FiCamera
                  size={40}
                  className="text-neutral-300 mx-auto mb-4 group-hover:text-primary-500 transition-colors"
                />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Adicionar Foto
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {imagemUrl && (
            <button
              onClick={handleAiFill}
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
              ) : (
                <>
                  <FiZap /> Autocompletar com IA
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-3 p-4 md:p-6 overflow-y-auto max-h-screen">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Espécie / Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Jiboia Prateada"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 dark:placeholder:text-neutral-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Nome Científico
                </label>
                <input
                  type="text"
                  value={nomeCientifico}
                  onChange={(e) => setNomeCientifico(e.target.value)}
                  placeholder="Scindapsus pictus"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 italic dark:placeholder:text-neutral-600 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Luminosidade
                </label>
                <div className="relative">
                  <FiSun className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                  <select
                    value={luz}
                    onChange={(e) => setLuz(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold appearance-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  >
                    <option>Sombra</option>
                    <option>Meia-sombra</option>
                    <option>Luz Difusa</option>
                    <option>Sol Pleno</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Ciclo de Rega
                </label>
                <div className="relative">
                  <FiDroplet className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
                  <input
                    type="number"
                    value={intervaloRega}
                    onChange={(e) => setIntervaloRega(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Última Rega
                </label>
                <input
                  type="date"
                  value={ultimaRega}
                  onChange={(e) => setUltimaRega(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-[11px] font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Próxima Rega
                </label>
                <input
                  type="date"
                  value={proximaRega}
                  onChange={handleProximaRegaChange}
                  className="w-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-none rounded-2xl px-5 py-4 text-[11px] font-black shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                Cuidados & Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                placeholder="Instruções específicas..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 resize-none transition-all dark:placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={lembretesAtivos}
                    onChange={(e) => setLembretesAtivos(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer-checked:bg-primary-500 transition-all shadow-inner"></div>
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
                </div>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">
                  Notificações
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={petFriendly}
                    onChange={(e) => setPetFriendly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer-checked:bg-primary-500 transition-all shadow-inner"></div>
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
                </div>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">
                  Pet Friendly
                </span>
              </label>
            </div>

            <div className="pt-8 flex flex-wrap justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-4 text-neutral-500 font-bold text-sm hover:text-neutral-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !nome || !imagemUrl}
                className="px-10 py-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
              >
                {loading ? "Processando..." : "Finalizar Cadastro"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
