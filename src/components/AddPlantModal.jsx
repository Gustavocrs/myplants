"use client";

import heic2any from "heic2any";
import { useEffect, useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { api } from "../services/api";

export default function AddPlantModal({
  onClose,
  onSuccess,
  plantToEdit,
  initialData,
  onDelete,
}) {
  useEscapeKey(onClose);
  const { user } = useAuth();
  const [nome, setNome] = useState("");
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
  const [imagemUrl, setImagemUrl] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Preenche os dados se estiver editando
  useEffect(() => {
    if (plantToEdit) {
      setNome(plantToEdit.nome);
      setNomeCientifico(plantToEdit.nomeCientifico || "");
      setLuz(plantToEdit.luz || "Meia-sombra");
      setIntervaloRega(plantToEdit.intervaloRega || 7);
      setPetFriendly(plantToEdit.petFriendly || false);
      setObservacoes(plantToEdit.observacoes || "");
      if (plantToEdit.dataAquisicao) {
        const date = new Date(plantToEdit.dataAquisicao);
        setDataAquisicao(date.toISOString().split("T")[0]);
      }
      if (plantToEdit.ultimaRega) {
        const date = new Date(plantToEdit.ultimaRega);
        setUltimaRega(date.toISOString().split("T")[0]);
      }
      setLembretesAtivos(plantToEdit.lembretesAtivos !== false);
      setImagemUrl(plantToEdit.imagemUrl);
      setPreview(plantToEdit.imagemUrl);
    }
    // Preenche com dados da IA se houver
    else if (initialData) {
      setNome(initialData.nome || "");
      setNomeCientifico(initialData.nomeCientifico || "");
      setLuz(initialData.luz || "Meia-sombra");
      setIntervaloRega(initialData.intervaloRega || 7);
      setPetFriendly(!!initialData.petFriendly);
      setObservacoes(initialData.observacoes || "");
      if (initialData.imagemUrl) {
        setImagemUrl(initialData.imagemUrl);
        setPreview(initialData.imagemUrl);
      }
    }
  }, [plantToEdit, initialData]);

  // Sincroniza a próxima rega baseada na última rega + intervalo
  useEffect(() => {
    if (ultimaRega && intervaloRega) {
      const last = new Date(ultimaRega);
      // Adiciona os dias do intervalo para calcular a próxima
      const next = new Date(
        last.getTime() + Number(intervaloRega) * 24 * 60 * 60 * 1000,
      );
      setProximaRega(next.toISOString().split("T")[0]);
    }
  }, [ultimaRega, intervaloRega]);

  // Atualiza a última rega se o usuário mudar a próxima rega manualmente
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

  // Gerencia a seleção da imagem e cria o preview
  const handleImageChange = async (e) => {
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
        alert("Erro ao converter imagem HEIC");
        return;
      }
    }

    compressImage(file);
  };

  // Função para redimensionar e comprimir a imagem
  const compressImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 800; // Redimensiona para no máximo 800px
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

        // Converte para JPEG com 70% de qualidade (reduz muito o tamanho)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setImagemUrl(dataUrl);
        setPreview(dataUrl);
      };
    };
  };

  // Converte Base64 para File para enviar para a API
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleAiFill = async () => {
    if (!imagemUrl) return;
    setLoading(true);
    try {
      let payload;
      if (imagemUrl.startsWith("data:")) {
        payload = dataURLtoFile(imagemUrl, "plant-image.jpg");
      } else {
        // Envia a URL direto para o backend processar localmente
        payload = imagemUrl;
      }

      const data = await api.identifyPlant(payload, user.uid, nome);

      // Preenche os campos com os dados da IA
      if (data.nome) setNome(data.nome);
      if (data.nomeCientifico) setNomeCientifico(data.nomeCientifico);
      if (data.luz) setLuz(data.luz);
      if (data.intervaloRega) setIntervaloRega(data.intervaloRega);
      setPetFriendly(!!data.petFriendly);
      // Adiciona as observações da IA (incluindo dicas de saúde)
      if (data.observacoes) setObservacoes(data.observacoes);
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("Erro ao consultar IA: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verifica se houve alterações no formulário
  const hasChanges = () => {
    if (plantToEdit) {
      return (
        nome !== plantToEdit.nome ||
        nomeCientifico !== (plantToEdit.nomeCientifico || "") ||
        luz !== (plantToEdit.luz || "Meia-sombra") ||
        String(intervaloRega) !== String(plantToEdit.intervaloRega || 7) ||
        petFriendly !== (plantToEdit.petFriendly || false) ||
        lembretesAtivos !== (plantToEdit.lembretesAtivos !== false) ||
        ultimaRega !==
          (plantToEdit.ultimaRega
            ? new Date(plantToEdit.ultimaRega).toISOString().split("T")[0]
            : "") ||
        dataAquisicao !==
          (plantToEdit.dataAquisicao
            ? new Date(plantToEdit.dataAquisicao).toISOString().split("T")[0]
            : "") ||
        observacoes !== (plantToEdit.observacoes || "") ||
        imagemUrl !== plantToEdit.imagemUrl
      );
    }
    // Se for nova planta, qualquer campo preenchido conta como mudança (exceto defaults)
    // Se veio initialData (IA), já consideramos que há dados para salvar
    return (
      nome !== "" ||
      nomeCientifico !== "" ||
      observacoes !== "" ||
      imagemUrl !== null ||
      dataAquisicao !== ""
    );
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
        petFriendly: petFriendly,
        lembretesAtivos,
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
        ultimaRega: ultimaRega ? new Date(ultimaRega) : null,
        notificationSent: false, // Reseta notificação ao editar para garantir novos alertas
        observacoes,
        imagemUrl,
        userId: user.uid,
        userEmail: user.email,
      };

      if (plantToEdit) {
        await api.updatePlant(plantToEdit._id, plantData);
      } else {
        await api.createPlant(plantData);
      }

      // Avisa o pai que salvou com sucesso e fecha
      if (onSuccess) onSuccess();
      else onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a planta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 overflow-y-auto animate-in fade-in duration-300 flex items-start justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden font-body animate-in zoom-in-95 duration-300 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 font-heading">
              {plantToEdit ? "Editar Planta" : "Nova Planta"}
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {plantToEdit
                ? "Atualize as informações da sua planta"
                : "Adicione uma nova planta ao seu jardim"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-2 hover:bg-neutral-100 rounded-lg transition-all"
          >
            <span className="text-lg font-bold">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
            {/* Coluna da Esquerda - Upload e IA */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* Área de Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center text-neutral-400 cursor-pointer hover:bg-primary-50/30 hover:border-primary-300 transition-all relative overflow-hidden group min-h-[200px]"
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg transition-all">
                        Trocar foto
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-primary-500 group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <p className="text-sm font-medium text-neutral-600">
                      Selecionar foto
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      JPG, PNG até 5MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*,.heic,.heif"
                />
              </div>

              {/* Botão IA */}
              {imagemUrl && (
                <button
                  onClick={handleAiFill}
                  disabled={loading}
                  className="w-full py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                      Analisando...
                    </>
                  ) : (
                    <>✨ Identificar com IA</>
                  )}
                </button>
              )}
            </div>

            {/* Coluna da Direita - Formulário */}
            <div className="md:col-span-3">
              <div className="space-y-4">
                {/* Nome */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      Nome Popular <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-neutral-400"
                      placeholder="Ex: Samambaia"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      Nome Científico
                    </label>
                    <input
                      type="text"
                      value={nomeCientifico}
                      onChange={(e) => setNomeCientifico(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-neutral-400 italic"
                      placeholder="Ex: Nephrolepis exaltata"
                    />
                  </div>
                </div>

                {/* Luz e Rega */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      ☀️ Luz
                    </label>
                    <select
                      value={luz}
                      onChange={(e) => setLuz(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all appearance-none"
                    >
                      <option value="Sombra">Sombra</option>
                      <option value="Meia-sombra">Meia-sombra</option>
                      <option value="Luz Difusa">Luz Difusa</option>
                      <option value="Sol Pleno">Sol Pleno</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      💧 Rega (dias)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={intervaloRega}
                      onChange={(e) => setIntervaloRega(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      📅 Aquisição
                    </label>
                    <input
                      type="date"
                      value={dataAquisicao}
                      onChange={(e) => setDataAquisicao(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                {/* Datas de Rega */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      Última rega
                    </label>
                    <input
                      type="date"
                      value={ultimaRega}
                      onChange={(e) => setUltimaRega(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      Próxima rega
                    </label>
                    <input
                      type="date"
                      value={proximaRega}
                      onChange={handleProximaRegaChange}
                      className="w-full bg-primary-50/50 border border-primary-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none placeholder:text-neutral-400"
                    placeholder="Cuidados especiais, história da planta..."
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={lembretesAtivos}
                        onChange={(e) => setLembretesAtivos(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 rounded-full peer-checked:bg-primary-500 transition-colors"></div>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform"></div>
                    </div>
                    <span className="text-sm text-neutral-700 font-medium group-hover:text-neutral-900 transition-colors">
                      Lembretes de rega
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={petFriendly}
                        onChange={(e) => setPetFriendly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 rounded-full peer-checked:bg-primary-500 transition-colors"></div>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform"></div>
                    </div>
                    <span className="text-sm text-neutral-700 font-medium group-hover:text-neutral-900 transition-colors">
                      Pet friendly
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <div>
            {plantToEdit && (
              <button
                onClick={() => onDelete(plantToEdit._id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                <FiTrash2 className="text-base" />
                Excluir
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={hasChanges() ? handleSave : onClose}
              disabled={loading || (hasChanges() && (!nome || !imagemUrl))}
              className={`px-5 py-2.5 rounded-lg transition-all text-sm font-medium disabled:opacity-50 ${
                hasChanges()
                  ? "bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current/30 border-t-current animate-spin rounded-full"></div>
              ) : hasChanges() ? (
                plantToEdit ? (
                  "Salvar alterações"
                ) : (
                  "Adicionar ao jardim"
                )
              ) : (
                "Fechar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
