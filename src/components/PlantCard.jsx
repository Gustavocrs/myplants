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
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-premium hover:shadow-xl overflow-hidden transition-all duration-500 group flex flex-col cursor-pointer hover:-translate-y-2 active:scale-[0.98] relative border border-neutral-100 dark:border-neutral-800 animate-fade-in"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {!imageError ? (
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
            <FiImage size={40} strokeWidth={1.5} className="opacity-40" />
            <span className="text-[10px] uppercase tracking-widest mt-3 font-semibold text-neutral-400">Sem imagem</span>
          </div>
        )}

        {/* Overlay gradient - Premium Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Top Actions - Glassmorphism */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          {isOverdue && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onWater) onWater(plant._id);
              }}
              className="glass dark:bg-white/10 text-primary-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
              title="Regar Rapidamente"
            >
              💧
            </button>
          )}
          <div
            className={`w-3 h-3 rounded-full shadow-lg ring-4 ring-white/20 ${getStatusColor()}`}
            title="Nível de detalhes da planta"
          />
        </div>

        {/* Edit Button - Glassmorphism */}
        {onEdit && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plant);
              }}
              className="glass dark:bg-white/10 text-white p-2.5 rounded-xl shadow-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
              title="Editar"
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
          </div>
        )}

        {/* Content Info Over Image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="font-heading text-lg font-bold leading-tight mb-1 drop-shadow-md">
            {plant.nome}
          </h3>
          {plant.nomeCientifico && (
            <p className="text-xs text-neutral-200 font-medium italic opacity-90 truncate max-w-[90%]">
              {plant.nomeCientifico}
            </p>
          )}
        </div>
      </div>

      {/* Footer Info Area - Modern Specs */}
      <div className="px-5 py-4 flex items-center justify-between bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800/50">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-tighter text-neutral-400 font-bold mb-0.5">Luz</span>
            <span className="text-lg leading-none" title={plant.luz}>
              {plant.luz === "Sol Pleno" ? "☀️" : plant.luz === "Sombra" ? "☁️" : plant.luz === "Luz Difusa" ? "🌤️" : "⛅"}
            </span>
          </div>
          <div className="h-6 w-px bg-neutral-100 dark:bg-neutral-800 mx-1" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-tighter text-neutral-400 font-bold mb-0.5">Rega</span>
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
              {plant.intervaloRega <= 3 ? "Frequente" : plant.intervaloRega <= 7 ? "Moderada" : "Espaçada"}
            </span>
          </div>
        </div>
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plant.petFriendly ? 'bg-primary-50 text-primary-600' : 'bg-red-50 text-red-500'} dark:bg-opacity-10`} title={plant.petFriendly ? "Pet Friendly" : "Tóxica"}>
          {plant.petFriendly ? "🐶" : "🚫"}
        </div>
      </div>
    </div>
  );
}
