"use client";

import {useState} from "react";
import {FiImage} from "react-icons/fi";

export default function PlantCard({plant, onClick, onEdit, onWater}) {
  const [imageError, setImageError] = useState(false);

  const isWateringOverdue = () => {
    if (!plant.ultimaRega || !plant.intervaloRega) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(plant.ultimaRega);
    nextDate.setDate(nextDate.getDate() + Number(plant.intervaloRega));
    nextDate.setHours(0, 0, 0, 0);
    return today > nextDate;
  };

  const isOverdue = isWateringOverdue();

  const getStatusColor = () => {
    if (isOverdue) return "bg-red-500 shadow-red-500/50";

    const hasScientific = !!plant.nomeCientifico;
    const hasNotes = !!plant.observacoes;
    const hasDate = !!plant.dataAquisicao;

    if (hasScientific && hasNotes && hasDate) return "bg-primary-500 shadow-primary-500/50";
    if (!hasScientific && !hasNotes && !hasDate) return "bg-accent-400 shadow-accent-400/50";
    return "bg-secondary-400 shadow-secondary-400/50";
  };

  return (
    <div
      onClick={() => onClick(plant)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer hover:-translate-y-1 active:scale-[0.98] relative border border-neutral-100"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
        {!imageError ? (
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50">
            <FiImage size={32} />
            <span className="text-xs mt-1.5 font-medium text-neutral-500">Sem imagem</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status dot */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {isOverdue && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onWater) onWater(plant._id);
              }}
              className="bg-white/90 text-blue-500 w-8 h-8 rounded-full shadow-sm flex items-center justify-center hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all text-sm"
              title="Regar Rapidamente"
            >
              💧
            </button>
          )}
          <div
            className={`w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white/50 ${getStatusColor()}`}
            title="Nível de detalhes da planta"
          />
        </div>

        {/* Edit button */}
        {onEdit && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plant);
              }}
              className="bg-white/90 text-neutral-600 p-2 rounded-lg shadow-sm hover:bg-white hover:text-primary-600 transition-all"
              title="Editar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
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
          </div>
        )}

        {/* Plant name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="font-heading text-base font-semibold leading-tight truncate">
            {plant.nome}
          </h3>
          {plant.nomeCientifico && (
            <p className="text-xs text-white/70 italic mt-0.5 truncate">
              {plant.nomeCientifico}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-50">
        <span className="text-sm" title={plant.luz}>
          {plant.luz === "Sol Pleno"
            ? "☀️"
            : plant.luz === "Sombra"
              ? "☁️"
              : plant.luz === "Luz Difusa"
                ? "🌤️"
                : "⛅"}
        </span>
        <span
          className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md"
          title={`Rega a cada ${plant.intervaloRega} dias`}
        >
          {plant.intervaloRega <= 3
            ? "Frequente"
            : plant.intervaloRega <= 7
              ? "Moderada"
              : "Espaçada"}
        </span>
        <span
          className="text-sm"
          title={plant.petFriendly ? "Pet Friendly" : "Tóxica"}
        >
          {plant.petFriendly ? "🐶" : "🚫"}
        </span>
      </div>
    </div>
  );
}
