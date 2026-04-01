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
  FiSmile,
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

  // Bloqueia o scroll da página quando o menu está aberto
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

  // Componente auxiliar para Chips de Filtro
  const FilterChip = ({
    active,
    onClick,
    icon,
    label,
    colorClass = "bg-green-100 text-green-800 border-green-200",
  }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border
        ${
          active
            ? `${colorClass} shadow-sm`
            : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  // Componente auxiliar para Seções
  const SectionTitle = ({icon: Icon, title}) => (
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 mt-6 first:mt-0">
      <Icon size={14} /> {title}
    </h3>
  );

  return (
    <>
      {/* Backdrop (Fundo Escuro) */}
      <div
        className={`
          fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-40 transition-opacity duration-500
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar (Drawer) */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/90 backdrop-blur-2xl shadow-2xl z-50 
          transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col font-body
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          border-l border-white/50
        `}
      >
        {/* Header do Menu */}
        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white/50">
          <h2 className="text-2xl font-black text-neutral-900 font-heading tracking-tight">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Ações Principais */}
          <SectionTitle icon={FiPlus} title="Adicionar" />
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddAI();
              }}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-100 rounded-2xl hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FiCpu size={20} />
              </div>
              <span className="text-sm font-bold text-purple-900">IA Scan</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddPlant();
              }}
              className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-100 rounded-2xl hover:bg-green-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FiEdit3 size={20} />
              </div>
              <span className="text-sm font-bold text-green-900">Manual</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex justify-between items-center mb-3">
            <SectionTitle icon={FiSun} title="Filtrar Plantas" />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 flex items-center gap-1 hover:underline"
              >
                <FiTrash2 /> Limpar
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
                    colorClass="bg-yellow-100 text-yellow-800 border-yellow-200"
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
                colorClass="bg-blue-100 text-blue-800 border-blue-200"
              />
              <FilterChip
                label="Moderada"
                icon="💧"
                active={filterRega === "1gota"}
                onClick={() =>
                  setFilterRega(filterRega === "1gota" ? "" : "1gota")
                }
                colorClass="bg-blue-100 text-blue-800 border-blue-200"
              />
              <FilterChip
                label="Frequente"
                icon="💧💧"
                active={filterRega === "2gotas"}
                onClick={() =>
                  setFilterRega(filterRega === "2gotas" ? "" : "2gotas")
                }
                colorClass="bg-blue-100 text-blue-800 border-blue-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Precisando de Rega"
                icon="🚨"
                active={filterAtrasada}
                onClick={() => setFilterAtrasada(!filterAtrasada)}
                colorClass="bg-red-100 text-red-800 border-red-200"
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
                colorClass="bg-red-100 text-red-800 border-red-200"
              />
            </div>
          </div>

          {/* Visualização */}
          <SectionTitle icon={FiEye} title="Agrupar Por" />
          <div className="flex flex-wrap gap-2 mb-8">
            <FilterChip
              label="Luminosidade"
              icon="💡"
              active={viewMode === "luz"}
              onClick={() => setViewMode(viewMode === "luz" ? null : "luz")}
              colorClass="bg-purple-100 text-purple-800 border-purple-200"
            />
            <FilterChip
              label="Rega"
              icon="💧"
              active={viewMode === "rega"}
              onClick={() => setViewMode(viewMode === "rega" ? null : "rega")}
              colorClass="bg-purple-100 text-purple-800 border-purple-200"
            />
            <FilterChip
              label="Pet"
              icon="🐶"
              active={viewMode === "pet"}
              onClick={() => setViewMode(viewMode === "pet" ? null : "pet")}
              colorClass="bg-purple-100 text-purple-800 border-purple-200"
            />
          </div>
        </div>

        {/* Footer (Configurações) */}
        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-neutral-600 hover:bg-white hover:text-primary-600 hover:shadow-premium transition-all font-bold text-sm"
          >
            <FiSettings size={20} className="animate-spin-slow" />
            <span>Configurações</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <FiLogOut size={20} />
            <span>Sair da conta</span>
          </button>
        </div>
      </div>

      {/* Botão Flutuante Principal (Trigger) */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-primary-900 text-white rounded-[1.5rem] shadow-2xl shadow-primary-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-white/10"
        >
          <FiMenu size={28} className="group-hover:rotate-12 transition-transform" />
        </button>

        {/* Indicador de Filtros Ativos (Bolinha) */}
        {hasFilters && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 border-4 border-white rounded-full shadow-lg animate-bounce"></span>
        )}
      </div>
    </>
  );
}
