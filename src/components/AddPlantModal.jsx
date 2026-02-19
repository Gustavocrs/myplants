"use client";

import {useState, useRef, useEffect} from "react";
import {db} from "../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";

export default function AddPlantModal({onClose, plantToEdit, onDelete}) {
  const {user} = useAuth();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Preenche os dados se estiver editando
  useEffect(() => {
    if (plantToEdit) {
      setName(plantToEdit.name);
      setImage(plantToEdit.imageUrl);
      setPreview(plantToEdit.imageUrl);
    }
  }, [plantToEdit]);

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

  const handleSave = async () => {
    if (!name || !image) return;
    setLoading(true);

    try {
      if (plantToEdit) {
        // Atualizar planta existente
        const plantRef = doc(db, "plants", plantToEdit.id);
        await updateDoc(plantRef, {
          name,
          imageUrl: image,
        });
      } else {
        // Criar nova planta
        await addDoc(collection(db, "plants"), {
          name,
          imageUrl: image,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      // Fecha o modal após sucesso
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a planta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {plantToEdit ? "Editar Planta" : "Nova Planta"}
          </h2>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Planta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Samambaia"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            {/* Botão de Excluir (apenas na edição) */}
            <div>
              {plantToEdit && (
                <button
                  onClick={() => onDelete(plantToEdit.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-2 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  🗑️ Excluir
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !name || !image}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Salvando..." : plantToEdit ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
