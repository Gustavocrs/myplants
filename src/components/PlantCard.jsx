"use client";

import {useState} from "react";
import {FiImage} from "react-icons/fi";

export default function PlantCard({plant, onClick, onEdit}) {
  const [imageError, setImageError] = useState(false);

  // Lógica para a cor da bolinha de status
  const getStatusColor = () => {
    const hasScientific = !!plant.nomeCientifico;
    const hasNotes = !!plant.observacoes;
    const hasDate = !!plant.dataAquisicao;

    // Verde: Totalmente preenchida (considerando os campos opcionais principais)
    if (hasScientific && hasNotes && hasDate) return "bg-green-500";
    // Vermelho: Apenas o básico (foto e nome são obrigatórios, então checamos a falta do resto)
    if (!hasScientific && !hasNotes && !hasDate) return "bg-orange-400";
    // Amarelo: Parcial
    return "bg-yellow-500";
  };

  return (
    <div
      onClick={() => onClick(plant)}
      className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer hover:-translate-y-1 active:scale-95 relative border border-gray-100"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <FiImage size={40} />
            <span className="text-xs mt-2">Imagem indisponível</span>
          </div>
        )}
        {/* Overlay sutil no hover para indicar clique */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Bolinha de Status - Movida para a esquerda */}
        <div
          className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full shadow-lg ring-2 ring-white/50 ${getStatusColor()}`}
          title="Nível de detalhes da planta"
        />

        {/* Botão de Editar - Aparece no Hover (Desktop) ou Sempre (Mobile) */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(plant);
            }}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-sm hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 translate-y-2 group-hover:translate-y-0"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        )}

        {/* Informações sobrepostas na imagem (Estilo Moderno) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3
            className="font-bold text-lg leading-tight shadow-black drop-shadow-md truncate"
            title={plant.nome}
          >
            {plant.nome}
          </h3>
          <p className="text-xs text-white/90 font-medium mt-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            {plant.nomeCientifico || "Espécie não identificada"}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 bg-white flex justify-between items-center border-t border-gray-50">
        <div className="flex gap-3 text-sm text-gray-500 w-full justify-around">
          <span
            title={plant.luz}
            className="flex flex-col items-center gap-1 text-xs"
          >
            {plant.luz === "Sol Pleno"
              ? "☀️"
              : plant.luz === "Sombra"
                ? "☁️"
                : plant.luz === "Luz Difusa"
                  ? "🌤️"
                  : "⛅"}
          </span>
          <span
            title={`Rega a cada ${plant.intervaloRega} dias`}
            className="flex flex-col items-center gap-1 text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full"
          >
            {plant.intervaloRega <= 3
              ? "Frequente"
              : plant.intervaloRega <= 7
                ? "Moderada"
                : "Espaçada"}
          </span>
          <span
            title={plant.petFriendly ? "Pet Friendly" : "Tóxica"}
            className="flex flex-col items-center gap-1 text-xs"
          >
            {plant.petFriendly ? "🐶" : "🚫"}
          </span>
        </div>
      </div>
    </div>
  );
}
