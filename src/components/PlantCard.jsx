"use client";

import {useState} from "react";
import {FiImage} from "react-icons/fi";

export default function PlantCard({plant, onClick, onEdit, onWater}) {
  const [imageError, setImageError] = useState(false);

  // Lógica para verificar se a planta está com a rega atrasada
  const isWateringOverdue = () => {
    if (!plant.ultimaRega || !plant.intervaloRega) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas datas
    const nextDate = new Date(plant.ultimaRega);
    nextDate.setDate(nextDate.getDate() + Number(plant.intervaloRega));
    nextDate.setHours(0, 0, 0, 0);
    return today > nextDate;
  };

  const isOverdue = isWateringOverdue();

  // Lógica para a cor da bolinha de status
  const getStatusColor = () => {
    // Se a rega estiver atrasada, a bolinha fica vermelha para alertar o usuário
    if (isOverdue) return "bg-red-500 shadow-red-500/50";

    const hasScientific = !!plant.nomeCientifico;
    const hasNotes = !!plant.observacoes;
    const hasDate = !!plant.dataAquisicao;

    // Verde: Totalmente preenchida
    if (hasScientific && hasNotes && hasDate) return "bg-primary-500 shadow-primary-500/50";
    // Amarelo: Parcial
    if (!hasScientific && !hasNotes && !hasDate) return "bg-accent-400 shadow-accent-400/50";
    // Laranja/Amarelo
    return "bg-secondary-400 shadow-secondary-400/50";
  };

  return (
    <div
      onClick={() => onClick(plant)}
      className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-premium hover:shadow-2xl overflow-hidden transition-all duration-500 group flex flex-col cursor-pointer hover:-translate-y-2 active:scale-95 relative border border-neutral-100 group font-body"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50">
            <FiImage size={40} />
            <span className="text-[10px] mt-2 font-bold uppercase tracking-widest opacity-50">Sem Imagem</span>
          </div>
        )}
        {/* Overlay sutil no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Indicadores */}
        <div className="absolute top-4 left-4 flex flex-col items-center gap-3 z-50">
          {/* Indicador de Rega Atrasada */}
          {isOverdue && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onWater) onWater(plant._id);
              }}
              className="glass text-blue-500 w-9 h-9 rounded-full shadow-lg flex items-center justify-center animate-bounce hover:animate-none hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/50 z-20"
              title="Regar Rapidamente"
            >
              <span className="text-sm leading-none drop-shadow-sm">💧</span>
            </button>
          )}

          {/* Bolinha de Status */}
          <div
            className={`w-3 h-3 rounded-full shadow-2xl ring-4 ring-white/30 ${getStatusColor()}`}
            title="Nível de detalhes da planta"
          />
        </div>

          {/* Botão de Editar - Aparece no Hover (Desktop) ou Sempre (Mobile) */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(plant);
                }}
                className="glass text-neutral-700 p-2 sm:p-2.5 rounded-xl shadow-lg hover:bg-white hover:text-primary-600 transition-all duration-300 border border-white/50"
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
            )}
          </div>

        {/* Informações sobrepostas */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <h3
            className="font-heading text-lg sm:text-xl font-black leading-tight drop-shadow-md truncate tracking-tight"
            title={plant.nome}
          >
            {plant.nome}
          </h3>
          <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            {plant.nomeCientifico || "Espécie não identificada"}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white flex justify-between items-center border-t border-neutral-50 group-hover:bg-neutral-50 transition-colors">
        <div className="flex gap-4 text-sm text-neutral-400 w-full justify-between items-center">
          <span
            title={plant.luz}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-neutral-100/50 text-base"
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
            className="text-[10px] font-black uppercase tracking-widest text-secondary-600 bg-secondary-100 px-3 py-1.5 rounded-xl shadow-sm shadow-secondary-100/50"
          >
            {plant.intervaloRega <= 3
              ? "Frequente"
              : plant.intervaloRega <= 7
                ? "Moderada"
                : "Espaçada"}
          </span>
          <span
            title={plant.petFriendly ? "Pet Friendly" : "Tóxica"}
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-base ${plant.petFriendly ? 'bg-primary-100/50' : 'bg-red-100/50'}`}
          >
            {plant.petFriendly ? "🐶" : "🚫"}
          </span>
        </div>
      </div>
    </div>
  );
}
