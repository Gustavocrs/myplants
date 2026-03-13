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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Setas de Navegação (Desktop) */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="hidden md:flex absolute left-8 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-50"
          title="Anterior"
        >
          <FiChevronLeft size={48} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden md:flex absolute right-8 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-50"
          title="Próxima"
        >
          <FiChevronRight size={48} />
        </button>
      )}

      <div
        className="w-full max-w-lg md:max-w-5xl md:h-[85vh] bg-white shadow-2xl flex flex-col md:flex-row rounded-3xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-md transition-colors"
        >
          <FiX size={20} />
        </button>

        {/* Coluna da Esquerda (Imagem) */}
        <div className="relative h-72 md:h-full md:w-1/2 shrink-0 bg-gray-100">
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-t md:from-black/50" />

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight shadow-black drop-shadow-lg">
              {plant.nome}
            </h2>
            {plant.nomeCientifico && (
              <p className="text-white/90 italic font-medium text-lg mt-1 opacity-90 truncate">
                {plant.nomeCientifico}
              </p>
            )}
          </div>
        </div>

        {/* Coluna da Direita (Detalhes) */}
        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-10 flex flex-col">
          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-3xl mb-1">
                  {plant.luz === "Sol Pleno"
                    ? "☀️"
                    : plant.luz === "Sombra"
                      ? "☁️"
                      : plant.luz === "Luz Difusa"
                        ? "🌤️"
                        : "⛅"}
                </span>
                <span className="font-medium text-yellow-900 text-sm">
                  {plant.luz || "Luz"}
                </span>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-3xl mb-1">
                  {plant.intervaloRega <= 3
                    ? "💧"
                    : plant.intervaloRega <= 7
                      ? "💧💧"
                      : "🌵"}
                </span>
                <span className="font-medium text-blue-900 text-sm">
                  {plant.intervaloRega} dias
                </span>
              </div>

              {plant.dataAquisicao && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-1">
                  <span className="text-3xl mb-1">📅</span>
                  <span className="font-medium text-gray-700 text-sm">
                    {new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}

              <div
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 ${plant.petFriendly ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
              >
                <span className="text-3xl mb-1">
                  {plant.petFriendly ? "🐶" : "🚫"}
                </span>
                <span
                  className={`font-medium text-sm ${plant.petFriendly ? "text-green-900" : "text-red-900"}`}
                >
                  {plant.petFriendly ? "Pet Friendly" : "Tóxica"}
                </span>
              </div>
            </div>

            {plant.observacoes && !isPublicView && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="block text-green-700 text-xs uppercase tracking-wider font-bold mb-2">
                  Observações & Cuidados
                </span>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {plant.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* Navegação Mobile */}
          <div className="flex justify-between mt-6 md:hidden pt-4 border-t border-gray-100">
            <button
              disabled={!hasPrev}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-30 flex items-center gap-1"
            >
              <FiChevronLeft /> Anterior
            </button>
            <button
              disabled={!hasNext}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-30 flex items-center gap-1"
            >
              Próxima <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
