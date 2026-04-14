"use client";

import {
  FiCalendar,
  FiClock,
  FiDroplet,
  FiInfo,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Image from "next/image";

export default function DetailView({ plant, onClose, onEdit, onDelete }) {
  if (!plant) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-900 flex flex-col md:flex-row overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-2xl transition-all active:scale-95 md:hidden"
      >
        <FiX size={24} />
      </button>

      <div className="w-full md:w-1/2 lg:w-2/5 h-[45vh] md:h-full relative shrink-0">
        <Image
          src={plant.imagemUrl}
          alt={plant.nome}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-900/20 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <span className="inline-block px-3 py-1 bg-primary-500/20 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Detalhes da Planta
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter leading-tight drop-shadow-2xl">
            {plant.nome}
          </h1>
          {plant.nomeCientifico && (
            <p className="text-white/70 italic text-lg md:text-xl font-medium mt-2">
              {plant.nomeCientifico}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 overflow-y-auto">
        <div className="hidden md:flex items-center justify-between p-8 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-4 text-neutral-400">
            <FiInfo />
            <span className="text-xs font-black uppercase tracking-widest">
              Informações do Cultivo
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-8 md:p-16 space-y-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-100 dark:bg-accent-900/30 text-accent-600 flex items-center justify-center text-xl mb-4">
                <FiSun />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                Luz
              </span>
              <span className="text-sm font-bold dark:text-white">
                {plant.luz}
              </span>
            </div>

            <div className="p-6 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xl mb-4">
                <FiDroplet />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                Rega
              </span>
              <span className="text-sm font-bold dark:text-white">
                {plant.intervaloRega} dias
              </span>
            </div>

            <div className="p-6 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 flex items-center justify-center text-xl mb-4">
                <FiClock />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                Idade
              </span>
              <span className="text-sm font-bold dark:text-white">
                {plant.dataAquisicao
                  ? "Desde " +
                    new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")
                  : "Nova"}
              </span>
            </div>

            <div className="p-6 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-2xl ${plant.petFriendly ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"} flex items-center justify-center text-xl mb-4`}
              >
                {plant.petFriendly ? "🐶" : "🚫"}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                Segurança
              </span>
              <span className="text-sm font-bold dark:text-white">
                {plant.petFriendly ? "Pet Friendly" : "Tóxica"}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black font-heading dark:text-white flex items-center gap-3">
              <FiCalendar className="text-primary-500" /> Histórico & Notas
            </h3>
            <div className="bg-neutral-50 dark:bg-neutral-800/30 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 relative">
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                {plant.observacoes ||
                  "Nenhuma observação registrada para esta planta."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-8">
            <button
              onClick={() => onEdit(plant._id)}
              className="px-10 py-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Editar Planta
            </button>
            <button
              onClick={() => onDelete(plant._id)}
              className="p-5 bg-red-50 text-red-500 rounded-[1.5rem] hover:bg-red-100 transition-all active:scale-95"
            >
              <FiTrash2 size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
