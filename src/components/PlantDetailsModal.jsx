"use client";
import { useEffect } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiShield,
  FiSun,
  FiX,
} from "react-icons/fi";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import Image from "next/image";

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

  const infoItems = [
    {
      id: "luz",
      label: "Luminosidade",
      val: plant.luz || "Não informado",
      icon: <FiSun />,
      color:
        "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
    },
    {
      id: "rega",
      label: "Ciclo de Rega",
      val: `Cada ${plant.intervaloRega} dias`,
      icon: <FiDroplet />,
      color:
        "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    },
    {
      id: "data",
      label: "No Jardim desde",
      val: plant.dataAquisicao
        ? new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")
        : "Recém chegada",
      icon: <FiCalendar />,
      color:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
    },
    {
      id: "pet",
      label: "Segurança",
      val: plant.petFriendly ? "Pet Friendly" : "Planta Tóxica",
      icon: <FiShield />,
      color: plant.petFriendly
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-md p-0 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      {/* Navigation Controls (Glassmorphism) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 md:px-12 pointer-events-none flex justify-between z-10">
        {hasPrev ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="pointer-events-auto glass dark:bg-white/10 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white hover:text-primary-600 shadow-2xl transition-all"
          >
            <FiChevronLeft size={28} />
          </button>
        ) : (
          <div />
        )}

        {hasNext ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="pointer-events-auto glass dark:bg-white/10 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white hover:text-primary-600 shadow-2xl transition-all"
          >
            <FiChevronRight size={28} />
          </button>
        ) : (
          <div />
        )}
      </div>

      <div
        className="w-full h-full md:h-auto md:max-w-5xl bg-white dark:bg-neutral-900 shadow-premium flex flex-col md:grid md:grid-cols-12 rounded-none md:rounded-[3rem] overflow-hidden relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button UI */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 glass dark:bg-black/20 text-white md:text-neutral-500 rounded-2xl w-12 h-12 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
        >
          <FiX size={24} />
        </button>

        {/* Media Block (5 columns) */}
        <div className="relative md:col-span-5 h-[50vh] md:h-[67vh] min-h-[300px] overflow-hidden">
          <Image
            src={plant.imagemUrl}
            alt={plant.nome}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />

          <div className="absolute bottom-8 left-8 right-8 text-white md:hidden">
            <h2 className="text-4xl font-black font-heading tracking-tighter drop-shadow-xl">
              {plant.nome}
            </h2>
            {plant.nomeCientifico && (
              <p className="text-white/80 italic font-medium mt-1">
                {plant.nomeCientifico}
              </p>
            )}
          </div>
        </div>

        {/* Content Block (7 columns) */}
        <div className="md:col-span-7 flex flex-col p-8 md:p-14 overflow-y-auto">
          <div className="hidden md:block mb-10">
            <span className="inline-block px-4 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              Detalhes da Espécie
            </span>
            <h2 className="text-5xl font-black text-neutral-900 dark:text-white font-heading tracking-tighter leading-tight">
              {plant.nome}
            </h2>
            {plant.nomeCientifico && (
              <p className="text-neutral-400 font-medium italic text-lg mt-2">
                {plant.nomeCientifico}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {infoItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-[2rem] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 hover:scale-[1.02] transition-transform"
              >
                <div
                  className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-lg mb-4 shadow-sm`}
                >
                  {item.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {plant.observacoes && (
            <div className="relative p-8 rounded-[2rem] bg-primary-50/30 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/40">
              <div className="absolute -top-3 left-8 px-4 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                Diário do Cultivo
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed font-medium">
                {plant.observacoes}
              </p>
            </div>
          )}

          {/* Footer Actions (Public View) */}
          <div className="mt-auto pt-10 flex items-center justify-between">
            <div className="text-neutral-300 dark:text-neutral-600">
              <p className="text-[9px] font-black uppercase tracking-widest">
                ID MyPlants
              </p>
              <p className="text-xs font-mono">{plant._id?.substring(0, 8)}</p>
            </div>

            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary-500/60 "></div>
              <div className="w-2 h-2 rounded-full bg-primary-500/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
