"use client";

import { useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";

export default function PlantCard({ plant, onClick, onEdit, onWater }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [plant.imagemUrl]);

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

    if (hasScientific && hasNotes && hasDate)
      return "bg-primary-500 shadow-primary-500/50";
    if (!hasScientific && !hasNotes && !hasDate)
      return "bg-accent-400 shadow-accent-400/50";
    return "bg-secondary-400 shadow-secondary-400/50";
  };

  return (
    <div
      onClick={() => onClick(plant)}
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-premium hover:shadow-xl overflow-hidden transition-all duration-500 group flex flex-col cursor-pointer hover:-translate-y-2 active:scale-[0.98] relative border border-neutral-100 dark:border-neutral-800 animate-fade-in"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {imageLoading && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 animate-spin rounded-full" />
          </div>
        )}
        {!imageError ? (
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out ${imageLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
            <FiImage size={40} strokeWidth={1.5} className="opacity-40" />
            <span className="text-[10px] uppercase tracking-widest mt-3 font-semibold text-neutral-400">
              Sem imagem
            </span>
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
        </div>

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
            <span className="text-[10px] uppercase tracking-tighter text-neutral-400 font-bold mb-0.5">
              Luz
            </span>
            <span className="text-lg leading-none" title={plant.luz}>
              {plant.luz === "Sol Pleno"
                ? "☀️"
                : plant.luz === "Sombra"
                  ? "☁️"
                  : plant.luz === "Luz Difusa"
                    ? "🌤️"
                    : "⛅"}
            </span>
          </div>
          <div className="h-6 w-px bg-neutral-100 dark:bg-neutral-800 mx-1" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-tighter text-neutral-400 font-bold mb-0.5">
              Rega
            </span>
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
              {plant.intervaloRega <= 3
                ? "Frequente"
                : plant.intervaloRega <= 7
                  ? "Moderada"
                  : "Espaçada"}
            </span>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${plant.petFriendly ? "bg-primary-50 text-primary-600" : "bg-red-50 text-red-500"} dark:bg-opacity-10`}
          title={plant.petFriendly ? "Pet Friendly" : "Tóxica"}
        >
          {plant.petFriendly ? "🐶" : "🚫"}
        </div>
      </div>
    </div>
  );
}
