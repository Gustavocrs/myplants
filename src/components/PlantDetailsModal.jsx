"use client";
import {useEffect} from "react";
import {FiX, FiChevronLeft, FiChevronRight} from "react-icons/fi";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export default function PlantDetailsModal({
  plant,
  onClose,
  isPublicView = false,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  useEscapeKey(onClose);
  
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!plant) return null;

  const luzIcon = (luz) => {
    switch (luz) {
      case "Sol Pleno": return "☀️";
      case "Sombra": return "☁️";
      case "Luz Difusa": return "🌤️";
      default: return "⛅";
    }
  };

  const waterIcon = (interval) => {
    if (interval <= 3) return "💧";
    if (interval <= 7) return "💧💧";
    return "🌵";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-0 md:p-6 animate-in fade-in duration-300 font-body"
      onClick={onClose}
    >
      {/* Navigation arrows (desktop) */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="hidden md:flex absolute left-6 text-white/60 hover:text-white transition-all p-3 rounded-full hover:bg-white/10 z-50"
          title="Anterior"
        >
          <FiChevronLeft size={32} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden md:flex absolute right-6 text-white/60 hover:text-white transition-all p-3 rounded-full hover:bg-white/10 z-50"
          title="Próxima"
        >
          <FiChevronRight size={32} />
        </button>
      )}

      <div
        className="w-full h-[100dvh] md:h-[80vh] md:max-w-4xl bg-white shadow-2xl flex flex-col md:flex-row rounded-none md:rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-neutral-600 rounded-lg p-2 transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <FiX size={20} />
        </button>

        {/* Image column */}
        <div className="relative h-64 sm:h-72 md:h-full md:w-2/5 shrink-0 bg-neutral-100 overflow-hidden">
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight font-heading">
              {plant.nome}
            </h2>
            {plant.nomeCientifico && (
              <p className="text-white/70 italic text-sm mt-1">
                {plant.nomeCientifico}
              </p>
            )}
          </div>
        </div>

        {/* Details column */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
          <div className="space-y-6 flex-1">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-4 rounded-xl text-center">
                <span className="text-2xl block mb-2">{luzIcon(plant.luz)}</span>
                <span className="text-xs font-medium text-neutral-600 block">
                  {plant.luz || "Luz"}
                </span>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl text-center">
                <span className="text-2xl block mb-2">{waterIcon(plant.intervaloRega)}</span>
                <span className="text-xs font-medium text-neutral-600 block">
                  A cada {plant.intervaloRega} dias
                </span>
              </div>

              {plant.dataAquisicao && (
                <div className="bg-neutral-50 p-4 rounded-xl text-center">
                  <span className="text-2xl block mb-2">📅</span>
                  <span className="text-xs font-medium text-neutral-600 block">
                    {new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}

              <div className={`p-4 rounded-xl text-center ${plant.petFriendly ? "bg-primary-50" : "bg-red-50"}`}>
                <span className="text-2xl block mb-2">{plant.petFriendly ? "🐶" : "🚫"}</span>
                <span className={`text-xs font-medium block ${plant.petFriendly ? "text-primary-700" : "text-red-700"}`}>
                  {plant.petFriendly ? "Pet Friendly" : "Tóxica"}
                </span>
              </div>
            </div>

            {/* Observations */}
            {plant.observacoes && !isPublicView && (
              <div className="bg-neutral-50 p-5 rounded-xl">
                <span className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                  Observações
                </span>
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {plant.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* Mobile navigation */}
          <div className="flex justify-between mt-6 md:hidden pt-6 border-t border-neutral-100">
            <button
              disabled={!hasPrev}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="flex-1 py-3 text-sm font-medium text-neutral-500 disabled:opacity-30 flex items-center justify-center gap-1"
            >
              <FiChevronLeft /> Anterior
            </button>
            <div className="w-px h-6 bg-neutral-100"></div>
            <button
              disabled={!hasNext}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="flex-1 py-3 text-sm font-medium text-primary-600 disabled:opacity-30 flex items-center justify-center gap-1"
            >
              Próxima <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
