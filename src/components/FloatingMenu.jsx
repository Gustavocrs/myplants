"use client";
import {useState, useEffect} from "react";
import {
  FiMenu,
  FiX,
  FiPlus,
  FiCpu,
  FiSettings,
  FiLogOut,
  FiEdit3,
  FiTrash2,
  FiSun,
  FiDroplet,
  FiEye,
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
    colorClass = "bg-primary-50 text-primary-700 border-primary-200",
  }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border
        ${
          active
            ? `${colorClass} shadow-sm`
            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
        }
      `}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const SectionTitle = ({icon: Icon, title}) => (
    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2 mt-6 first:mt-0">
      <Icon size={14} /> {title}
    </h3>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 
          transform transition-transform duration-300 ease-out flex flex-col font-body
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          border-l border-neutral-100
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 font-heading">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Ações Principais */}
          <SectionTitle icon={FiPlus} title="Adicionar" />
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddAI();
              }}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <FiCpu size={20} />
              </div>
              <span className="text-sm font-medium text-purple-900">IA Scan</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddPlant();
              }}
              className="flex flex-col items-center justify-center p-4 bg-primary-50 border border-primary-100 rounded-xl hover:bg-primary-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-white text-primary-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <FiEdit3 size={20} />
              </div>
              <span className="text-sm font-medium text-primary-900">Manual</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex justify-between items-center mb-3">
            <SectionTitle icon={FiSun} title="Filtrar Plantas" />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
              >
                <FiTrash2 size={12} /> Limpar
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["Sombra", "Meia-sombra", "Luz Difusa", "Sol Pleno"].map(
                (luz) => (
                  <FilterChip
                    key={luz}
                    label={luz}
                    icon={luz === "Sol Pleno" ? "☀️" : "☁️"}
                    active={filterLuz === luz}
                    onClick={() => setFilterLuz(filterLuz === luz ? "" : luz)}
                    colorClass="bg-yellow-50 text-yellow-800 border-yellow-200"
                  />
                ),
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Espaçada"
                icon="🌵"
                active={filterRega === "cacto"}
                onClick={() =>
                  setFilterRega(filterRega === "cacto" ? "" : "cacto")
                }
                colorClass="bg-blue-50 text-blue-800 border-blue-200"
              />
              <FilterChip
                label="Moderada"
                icon="💧"
                active={filterRega === "1gota"}
                onClick={() =>
                  setFilterRega(filterRega === "1gota" ? "" : "1gota")
                }
                colorClass="bg-blue-50 text-blue-800 border-blue-200"
              />
              <FilterChip
                label="Frequente"
                icon="💧💧"
                active={filterRega === "2gotas"}
                onClick={() =>
                  setFilterRega(filterRega === "2gotas" ? "" : "2gotas")
                }
                colorClass="bg-blue-50 text-blue-800 border-blue-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Precisando de Rega"
                icon="🚨"
                active={filterAtrasada}
                onClick={() => setFilterAtrasada(!filterAtrasada)}
                colorClass="bg-red-50 text-red-800 border-red-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Pet Friendly"
                icon="🐶"
                active={filterPet === "sim"}
                onClick={() => setFilterPet(filterPet === "sim" ? "" : "sim")}
              />
              <FilterChip
                label="Tóxica"
                icon="🚫"
                active={filterPet === "nao"}
                onClick={() => setFilterPet(filterPet === "nao" ? "" : "nao")}
                colorClass="bg-red-50 text-red-800 border-red-200"
              />
            </div>
          </div>

          {/* Visualização */}
          <SectionTitle icon={FiEye} title="Agrupar Por" />
          <div className="flex flex-wrap gap-2 mb-6">
            <FilterChip
              label="Luminosidade"
              icon="💡"
              active={viewMode === "luz"}
              onClick={() => setViewMode(viewMode === "luz" ? null : "luz")}
              colorClass="bg-purple-50 text-purple-800 border-purple-200"
            />
            <FilterChip
              label="Rega"
              icon="💧"
              active={viewMode === "rega"}
              onClick={() => setViewMode(viewMode === "rega" ? null : "rega")}
              colorClass="bg-purple-50 text-purple-800 border-purple-200"
            />
            <FilterChip
              label="Pet"
              icon="🐶"
              active={viewMode === "pet"}
              onClick={() => setViewMode(viewMode === "pet" ? null : "pet")}
              colorClass="bg-purple-50 text-purple-800 border-purple-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-2">
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all text-sm font-medium"
          >
            <FiSettings size={18} />
            <span>Configurações</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <FiLogOut size={18} />
            <span>Sair da conta</span>
          </button>
        </div>
      </div>

      {/* FAB Trigger */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/25 flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all"
        >
          <FiMenu size={22} />
        </button>

        {hasFilters && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-sm"></span>
        )}
      </div>
    </>
  );
}
