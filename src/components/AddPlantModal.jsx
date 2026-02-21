"use client";

import {useState, useRef, useEffect} from "react";
import {api} from "../services/api";
import {useAuth} from "@/context/AuthContext";

export default function AddPlantModal({
  onClose,
  onSuccess,
  plantToEdit,
  initialData,
  onDelete,
}) {
  const {user} = useAuth();
  const [name, setName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [light, setLight] = useState("Meia-sombra");
  const [wateringInterval, setWateringInterval] = useState(7);
  const [petFriendly, setPetFriendly] = useState(false);
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Preenche os dados se estiver editando
  useEffect(() => {
    if (plantToEdit) {
      setName(plantToEdit.name || plantToEdit.nome);
      setScientificName(plantToEdit.nomeCientifico || "");
      setLight(plantToEdit.luz || "Meia-sombra");
      setWateringInterval(plantToEdit.intervaloRega || 7);
      setPetFriendly(plantToEdit.petFriendly || false);
      setNotes(plantToEdit.observacoes || "");
      if (plantToEdit.dataAquisicao) {
        const date = new Date(plantToEdit.dataAquisicao);
        setAcquisitionDate(date.toISOString().split("T")[0]);
      }
      setImage(plantToEdit.imageUrl || plantToEdit.imagemUrl);
      setPreview(plantToEdit.imageUrl || plantToEdit.imagemUrl);
    }
    // Preenche com dados da IA se houver
    else if (initialData) {
      setName(initialData.nome || "");
      setScientificName(initialData.nomeCientifico || "");
      setLight(initialData.luz || "Meia-sombra");
      setWateringInterval(initialData.intervaloRega || 7);
      setPetFriendly(!!initialData.petFriendly);
      setNotes(initialData.observacoes || "");
      if (initialData.imageUrl) {
        setImage(initialData.imageUrl);
        setPreview(initialData.imageUrl);
      }
    }
  }, [plantToEdit, initialData]);

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
        setImage(dataUrl);
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
    if (!image) return;
    setLoading(true);
    try {
      const file = dataURLtoFile(image, "plant-image.jpg");
      const data = await api.identifyPlant(file);

      // Preenche os campos com os dados da IA
      if (data.nome) setName(data.nome);
      if (data.nomeCientifico) setScientificName(data.nomeCientifico);
      if (data.luz) setLight(data.luz);
      if (data.intervaloRega) setWateringInterval(data.intervaloRega);
      setPetFriendly(!!data.petFriendly);
      // Adiciona as observações da IA (incluindo dicas de saúde)
      if (data.observacoes) setNotes(data.observacoes);
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
        name !== (plantToEdit.name || plantToEdit.nome) ||
        scientificName !== (plantToEdit.nomeCientifico || "") ||
        light !== (plantToEdit.luz || "Meia-sombra") ||
        String(wateringInterval) !== String(plantToEdit.intervaloRega || 7) ||
        petFriendly !== (plantToEdit.petFriendly || false) ||
        acquisitionDate !==
          (plantToEdit.dataAquisicao
            ? new Date(plantToEdit.dataAquisicao).toISOString().split("T")[0]
            : "") ||
        notes !== (plantToEdit.observacoes || "") ||
        image !== (plantToEdit.imageUrl || plantToEdit.imagemUrl)
      );
    }
    // Se for nova planta, qualquer campo preenchido conta como mudança (exceto defaults)
    // Se veio initialData (IA), já consideramos que há dados para salvar
    return (
      name !== "" ||
      scientificName !== "" ||
      notes !== "" ||
      image !== null ||
      acquisitionDate !== ""
    );
  };

  const handleSave = async () => {
    if (!name || !image) return;
    setLoading(true);

    try {
      const plantData = {
        nome: name, // Backend espera 'nome', não 'name'
        nomeCientifico: scientificName,
        luz: light,
        intervaloRega: Number(wateringInterval),
        petFriendly: petFriendly,
        dataAquisicao: acquisitionDate ? new Date(acquisitionDate) : null,
        observacoes: notes,
        imagemUrl: image, // Backend espera 'imagemUrl'
        userId: user.uid,
        userEmail: user.email,
      };

      if (plantToEdit) {
        await api.updatePlant(plantToEdit.id, plantData);
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {plantToEdit ? "Editar Planta" : "Nova Planta"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Área de Upload Clicável */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden group"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <p className="group-hover:scale-110 transition-transform duration-200">
                    📸 Upload de Foto
                  </p>
                  <span className="text-xs mt-1">(Toque para selecionar)</span>
                </>
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

            {/* Botão de IA para preenchimento */}
            {image && (
              <button
                onClick={handleAiFill}
                disabled={loading}
                className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                {loading
                  ? "Analisando..."
                  : "✨ Preencher dados e avaliar saúde com IA"}
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Popular *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Samambaia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Científico
                </label>
                <input
                  type="text"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Nephrolepis exaltata"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Luminosidade
                </label>
                <select
                  value={light}
                  onChange={(e) => setLight(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="Sombra">Sombra</option>
                  <option value="Meia-sombra">Meia-sombra</option>
                  <option value="Luz Difusa">Luz Difusa</option>
                  <option value="Sol Pleno">Sol Pleno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Rega (dias)
                </label>
                <input
                  type="number"
                  min="1"
                  value={wateringInterval}
                  onChange={(e) => setWateringInterval(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Aquisição
                </label>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="petFriendly"
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="petFriendly" className="text-sm text-gray-700">
                Pet Friendly (Segura para animais)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avaliação
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Cuidados especiais, história da planta..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            {/* Botão de Excluir (apenas na edição) */}
            <div>
              {plantToEdit && (
                <button
                  onClick={() => onDelete(plantToEdit.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <span className="text-lg">🗑️</span>
                  <span className="hidden md:inline">Excluir</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={hasChanges() ? handleSave : onClose}
                disabled={loading || (hasChanges() && (!name || !image))}
                className={`px-6 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 font-medium ${
                  hasChanges()
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {loading ? (
                  "Salvando..."
                ) : hasChanges() ? (
                  <>
                    <span className="md:hidden text-lg">💾</span>
                    <span className="hidden md:inline">
                      {plantToEdit ? "Atualizar" : "Salvar"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="md:hidden text-lg">✕</span>
                    <span className="hidden md:inline">Fechar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
