"use client";

import {useState, useRef, useEffect} from "react";
import {api} from "../services/api";
import {useAuth} from "@/context/AuthContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { FiTrash2 } from "react-icons/fi";

export default function AddPlantModal({
  onClose,
  onSuccess,
  plantToEdit,
  initialData,
  onDelete,
}) {
  useEscapeKey(onClose);
  const {user} = useAuth();
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file);
    }
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
    return new File([u8arr], filename, {type: mime});
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
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-50 overflow-y-auto animate-in fade-in duration-300 flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl lg:max-w-4xl bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden font-body animate-in zoom-in-95 duration-300 my-auto h-fit flex flex-col">
        <div className="p-5 md:p-8 relative text-left flex flex-col gap-5 text-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-neutral-900 font-heading tracking-tight">
              {plantToEdit ? "Editar Planta" : "Nova Planta"}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-900 hover:text-primary-600 p-1.5 hover:bg-neutral-100/50 rounded-xl transition-all"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Coluna da Esquerda (Upload e IA) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-4">
              {/* Área de Upload Clicável */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video lg:aspect-square bg-neutral-100/50 border-2 border-dashed border-neutral-300 rounded-[1.5rem] flex flex-col items-center justify-center text-neutral-400 cursor-pointer hover:bg-primary-50/50 hover:border-primary-400 transition-all relative overflow-hidden group shadow-inner min-h-[160px]"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                      📸
                    </div>
                    <p className="font-bold text-xs text-neutral-500">Toque para selecionar</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Upload de Foto</span>
                  </div>
                )}
                {/* Input invisível */}
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              {/* Botão de IA */}
              {imagemUrl && (
                <button
                  onClick={handleAiFill}
                  disabled={loading}
                  className="w-full py-3 bg-primary-900 text-white rounded-xl shadow-xl shadow-primary-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-sm border-2 border-white/10"
                >
                  {loading
                    ? "✨ Analisando com IA..."
                    : "✨ Preencher dados com IA"}
                </button>
              )}
            </div>

            {/* Coluna da Direita (Formulário) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Nome Popular *
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium text-sm"
                    placeholder="Ex: Samambaia"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Nome Científico
                  </label>
                  <input
                    type="text"
                    value={nomeCientifico}
                    onChange={(e) => setNomeCientifico(e.target.value)}
                    className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium text-sm"
                    placeholder="Ex: Nephrolepis exaltata"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Luz
                  </label>
                  <select
                    value={luz}
                    onChange={(e) => setLuz(e.target.value)}
                    className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium appearance-none text-sm"
                  >
                    <option value="Sombra">Sombra</option>
                    <option value="Meia-sombra">Meia-sombra</option>
                    <option value="Luz Difusa">Luz Difusa</option>
                    <option value="Sol Pleno">Sol Pleno</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Rega a cada (dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={intervaloRega}
                    onChange={(e) => setIntervaloRega(e.target.value)}
                    className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Última Rega
                  </label>
                  <input
                    type="date"
                    value={ultimaRega}
                    onChange={(e) => setUltimaRega(e.target.value)}
                    className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Próxima Rega
                  </label>
                  <input
                    type="date"
                    value={proximaRega}
                    onChange={handleProximaRegaChange}
                    className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-secondary-100 focus:border-secondary-300 transition-all shadow-sm font-bold text-secondary-900 text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    value={dataAquisicao}
                    onChange={(e) => setDataAquisicao(e.target.value)}
                    className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium text-sm"
                  />
                </div>
                
                <div className="flex flex-col gap-3 justify-center sm:col-span-2 md:col-span-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="lembretesAtivos"
                      checked={lembretesAtivos}
                      onChange={(e) => setLembretesAtivos(e.target.checked)}
                      className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500 transition-all cursor-pointer"
                    />
                    <label
                      htmlFor="lembretesAtivos"
                      className="text-xs text-neutral-700 font-bold cursor-pointer"
                    >
                      🔔 Receber lembretes
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="petFriendly"
                      checked={petFriendly}
                      onChange={(e) => setPetFriendly(e.target.checked)}
                      className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500 transition-all cursor-pointer"
                    />
                    <label htmlFor="petFriendly" className="text-xs text-neutral-700 font-medium cursor-pointer">
                      🐾 Pet Friendly
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Avaliação Botânica & Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full bg-white border border-neutral-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium resize-none flex-1 min-h-[60px] text-sm"
                  placeholder="Cuidados especiais, história da planta..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-neutral-50 p-5 md:px-8 border-t border-neutral-100 mt-auto">
          {/* Botão de Excluir */}
            <div>
              {plantToEdit && (
                <button
                  onClick={() => onDelete(plantToEdit._id)}
                  className="text-red-500 hover:text-red-700 text-xs font-black uppercase tracking-widest px-3 py-2 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                >
                  <FiTrash2 className="text-base" />
                  <span className="hidden md:inline">Excluir</span>
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={hasChanges() ? handleSave : onClose}
                disabled={loading || (hasChanges() && (!nome || !imagemUrl))}
                className={`px-6 py-3 rounded-xl transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 font-bold text-sm hover:scale-105 active:scale-95 ${
                  hasChanges()
                    ? "bg-primary-500 text-white shadow-primary-500/25"
                    : "bg-white text-neutral-700 border border-neutral-200"
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                ) : hasChanges() ? (
                  <>
                    <span>{plantToEdit ? "Salvar Alterações" : "Adicionar ao Jardim"}</span>
                  </>
                ) : (
                  <span>Fechar</span>
                )}
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
