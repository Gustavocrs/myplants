"use client";
import { useEffect, useState } from "react";
import {
  FiCpu,
  FiDroplet,
  FiEdit3,
  FiEye,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSettings,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";

export default function FloatingMenu({
  onAddPlant,
  onAddAI,
  onOpenSettings,
  onLogout,
  filterLuz,
  setFilterLuz,
  filterRega,
  setFilterRega,
  filterPet,
  setFilterPet,
  filterAtrasada,
  setFilterAtrasada,
  viewMode,
  setViewMode,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const hasFilters =
    filterLuz || filterRega || filterPet || filterAtrasada || viewMode;

  const clearFilters = () => {
    setFilterLuz("");
    setFilterRega("");
    setFilterPet("");
    setFilterAtrasada(false);
    setViewMode(null);
  };

  const FilterChip = ({
    active,
    onClick,
    icon,
    label,
    colorClass = "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800",
  }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border
        ${
          active
            ? `${colorClass} shadow-md scale-105`
            : "bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 shadow-sm"
        }
      `}
    >
      <span className="text-base">{icon}</span>
      <span className="uppercase tracking-tight">{label}</span>
    </button>
  );

  const SectionTitle = ({ icon: Icon, title }) => (
    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-8 first:mt-0">
      <Icon size={12} className="text-primary-500" /> {title}
    </h3>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[50] transition-opacity duration-500
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar - Premium Design */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[90vw] glass dark:bg-neutral-900/80 shadow-premium z-[60] 
          transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col font-body
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          border-l border-white/20 dark:border-neutral-800/40
        `}
      >
        {/* Header Area */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-100 dark:border-neutral-800/50">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white font-heading">
              Menu
            </h2>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Ações e Filtros
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
          {/* Quick Actions */}
          <SectionTitle icon={FiPlus} title="Cadastro IA" />
          <div className="grid grid-cols-1 gap-3 mb-8">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddAI();
              }}
              className="group relative overflow-hidden flex items-center gap-4 p-4 bg-primary-600 rounded-2xl transition-all hover:bg-primary-700 shadow-lg shadow-primary-600/20 active:scale-95"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiCpu size={24} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">Scan com IA</p>
                <p className="text-primary-100 text-[10px] opacity-80 uppercase font-black">
                  Identificar Planta
                </p>
              </div>
              {/* Animation Decor */}
              <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            </button>
          </div>

          <SectionTitle icon={FiSun} title="Luminosidade" />
          <div className="flex flex-wrap gap-2">
            {[
              { l: "Sombra", i: "☁️" },
              { l: "Meia-sombra", i: "⛅" },
              { l: "Luz Difusa", i: "🌤️" },
              { l: "Sol Pleno", i: "☀️" },
            ].map(({ l, i }) => (
              <FilterChip
                key={l}
                label={l}
                icon={i}
                active={filterLuz === l}
                onClick={() => setFilterLuz(filterLuz === l ? "" : l)}
                colorClass="bg-accent-100 text-accent-800 border-accent-200 dark:bg-accent-900/30 dark:text-accent-300 dark:border-accent-800"
              />
            ))}
          </div>

          <SectionTitle icon={FiDroplet} title="Frequência de Rega" />
          <div className="flex flex-wrap gap-2">
            {[
              { id: "cacto", l: "Espaçada", i: "🌵" },
              { id: "1gota", l: "Moderada", i: "💧" },
              { id: "2gotas", l: "Frequente", i: "🌊" },
            ].map(({ id, l, i }) => (
              <FilterChip
                key={id}
                label={l}
                icon={i}
                active={filterRega === id}
                onClick={() => setFilterRega(filterRega === id ? "" : id)}
                colorClass="bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              />
            ))}
          </div>

          <SectionTitle icon={FiEye} title="Visualização" />
          <div className="flex flex-wrap gap-2">
            {[
              { id: "luz", l: "Por Luz", i: "💡" },
              { id: "rega", l: "Por Rega", i: "💧" },
              { id: "pendente", l: "Pendentes", i: "🚨" },
              { id: "pet", l: "Por Pets", i: "🐶" },
            ].map(({ id, l, i }) => (
              <FilterChip
                key={id}
                label={l}
                icon={i}
                active={viewMode === id}
                onClick={() => setViewMode(viewMode === id ? null : id)}
                colorClass="bg-primary-50 text-primary-900 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800"
              />
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-neutral-100 dark:border-neutral-800/50 bg-neutral-50 dark:bg-white/5 space-y-3">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 py-3 mb-2 rounded-xl text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-all border border-dashed border-red-200"
            >
              <FiTrash2 size={14} /> Limpar Todos Filtros
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-neutral-600 dark:text-neutral-400 font-bold text-sm bg-white dark:bg-neutral-800/50 shadow-sm hover:shadow-md hover:text-primary-600 transition-all"
          >
            <FiSettings size={20} /> Configurações
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-all"
          >
            <FiLogOut size={20} /> Sair do Jardim
          </button>
        </div>
      </div>

      {/* FAB - Floating Action Button Premium */}
      <div className="fixed bottom-8 right-8 z-[50] group select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-primary-600 text-white rounded-[1.75rem] shadow-premium flex items-center justify-center hover:bg-primary-700 hover:scale-110 active:scale-95 transition-all duration-300 group-hover:shadow-2xl"
        >
          <FiMenu size={28} />
        </button>
      </div>
    </>
  );
}
