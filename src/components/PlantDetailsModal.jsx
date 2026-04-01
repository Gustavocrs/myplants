"use client";
import {useEffect} from "react";
import {FiX, FiChevronLeft, FiChevronRight} from "react-icons/fi";

export default function PlantDetailsModal({
  plant,
  onClose,
  isPublicView = false,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  // Bloqueia o scroll do corpo da página quando o modal abre
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!plant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-md p-0 md:p-6 animate-in fade-in duration-300 font-body"
      onClick={onClose}
    >
      {/* Setas de Navegação (Desktop) */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="hidden md:flex absolute left-8 text-white/50 hover:text-white transition-all p-4 rounded-full hover:bg-white/10 z-50 group hover:scale-110 active:scale-95"
          title="Anterior"
        >
          <FiChevronLeft size={48} className="drop-shadow-lg" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden md:flex absolute right-8 text-white/50 hover:text-white transition-all p-4 rounded-full hover:bg-white/10 z-50 group hover:scale-110 active:scale-95"
          title="Próxima"
        >
          <FiChevronRight size={48} className="drop-shadow-lg" />
        </button>
      )}

      <div
        className="w-full h-[100dvh] md:h-[85vh] md:max-w-5xl glass bg-white/90 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row rounded-none md:rounded-[3rem] overflow-hidden relative border border-white/50 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 glass bg-white/80 hover:bg-white text-neutral-900 rounded-2xl p-3 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/50"
        >
          <FiX size={24} />
        </button>

        {/* Coluna da Esquerda (Imagem) */}
        <div className="relative h-96 md:h-full md:w-1/2 shrink-0 bg-neutral-100 overflow-hidden">
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h2 className="text-4xl md:text-5xl font-black leading-tight drop-shadow-lg font-heading tracking-tight">
              {plant.nome}
            </h2>
            {plant.nomeCientifico && (
              <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-3 drop-shadow-md">
                {plant.nomeCientifico}
              </p>
            )}
          </div>
        </div>

        {/* Coluna da Direita (Detalhes) */}
        <div className="flex-1 overflow-y-auto bg-transparent p-10 md:p-12 flex flex-col no-scrollbar">
          <div className="space-y-12 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-accent-50/50 p-6 rounded-[2rem] border border-accent-100 flex flex-col items-center justify-center text-center gap-2 group hover:bg-accent-100/50 transition-colors">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {plant.luz === "Sol Pleno"
                    ? "☀️"
                    : plant.luz === "Sombra"
                      ? "☁️"
                      : plant.luz === "Luz Difusa"
                        ? "🌤️"
                        : "⛅"}
                </span>
                <span className="font-bold text-accent-900 text-xs uppercase tracking-widest">
                  {plant.luz || "Luz"}
                </span>
              </div>

              <div className="bg-secondary-50/50 p-6 rounded-[2rem] border border-secondary-100 flex flex-col items-center justify-center text-center gap-2 group hover:bg-secondary-100/50 transition-colors">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {plant.intervaloRega <= 3
                    ? "💧"
                    : plant.intervaloRega <= 7
                      ? "💧💧"
                      : "🌵"}
                </span>
                <span className="font-bold text-secondary-900 text-xs uppercase tracking-widest">
                  {plant.intervaloRega} dias
                </span>
              </div>

              {plant.dataAquisicao && (
                <div className="bg-neutral-50/50 p-6 rounded-[2rem] border border-neutral-100 flex flex-col items-center justify-center text-center gap-2 group hover:bg-neutral-100 transition-colors">
                  <span className="text-4xl group-hover:scale-110 transition-transform">📅</span>
                  <span className="font-bold text-neutral-700 text-xs uppercase tracking-widest">
                    {new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}

              <div
                className={`p-6 rounded-[2rem] border flex flex-col items-center justify-center text-center gap-2 group transition-colors ${plant.petFriendly ? "bg-primary-50/50 border-primary-100 hover:bg-primary-100/50" : "bg-red-50/50 border-red-100 hover:bg-red-100/50"}`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {plant.petFriendly ? "🐶" : "🚫"}
                </span>
                <span
                  className={`font-bold text-xs uppercase tracking-widest ${plant.petFriendly ? "text-primary-900" : "text-red-900"}`}
                >
                  {plant.petFriendly ? "Pet Friendly" : "Tóxica"}
                </span>
              </div>
            </div>

            {plant.observacoes && !isPublicView && (
              <div className="bg-primary-50/30 p-8 rounded-[2.5rem] border border-primary-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100/50 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <span className="block text-primary-900 text-[10px] uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
                  Observações & Diagnóstico
                </span>
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                  {plant.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* Navegação Mobile */}
          <div className="flex justify-between mt-10 md:hidden pt-8 border-t border-neutral-100">
            <button
              disabled={!hasPrev}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-neutral-400 disabled:opacity-20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <FiChevronLeft className="text-lg" /> Anterior
            </button>
            <div className="w-px h-8 bg-neutral-100"></div>
            <button
              disabled={!hasNext}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-primary-600 disabled:opacity-20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Próxima <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
