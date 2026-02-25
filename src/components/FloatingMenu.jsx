"use client";
import {useState} from "react";
import {
  FiCamera,
  FiCpu,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiX,
  FiLayout,
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
  viewMode,
  setViewMode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);

  // Helper para renderizar opções de filtro
  const renderFilterOptions = (type) => {
    const options = {
      luz: [
        {value: "Sombra", icon: "☁️", label: "Sombra"},
        {value: "Meia-sombra", icon: "⛅", label: "Meia"},
        {value: "Luz Difusa", icon: "🌤️", label: "Difusa"},
        {value: "Sol Pleno", icon: "☀️", label: "Sol"},
      ],
      rega: [
        {value: "cacto", icon: "🌵", label: "Espaçada"},
        {value: "1gota", icon: "💧", label: "Moderada"},
        {value: "2gotas", icon: "💧💧", label: "Frequente"},
        {value: "3gotas", icon: "💧💧💧", label: "Intensa"},
      ],
      pet: [
        {value: "sim", icon: "🐶", label: "Amigo"},
        {value: "nao", icon: "🚫", label: "Tóxica"},
      ],
      view: [
        {value: "luz", icon: "💡", label: "Luz"},
        {value: "rega", icon: "💧", label: "Rega"},
        {value: "pet", icon: "🐶", label: "Pet"},
      ],
    };

    const currentOptions = options[type] || [];
    const currentValue =
      type === "luz"
        ? filterLuz
        : type === "rega"
          ? filterRega
          : type === "pet"
            ? filterPet
            : viewMode;
    const setValue =
      type === "luz"
        ? setFilterLuz
        : type === "rega"
          ? setFilterRega
          : type === "pet"
            ? setFilterPet
            : setViewMode;

    return (
      <div className="flex gap-2 mt-2 justify-end animate-in slide-in-from-right-4 fade-in duration-300">
        {currentOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              setValue(
                currentValue === opt.value
                  ? type === "view"
                    ? null
                    : ""
                  : opt.value,
              );
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-sm border transition-all ${
              currentValue === opt.value
                ? "bg-green-100 border-green-300 text-green-800 scale-110"
                : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
            }`}
            title={opt.label}
          >
            <span className="text-lg leading-none">{opt.icon}</span>
            <span className="hidden md:block text-[8px] font-bold uppercase mt-0.5">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  // Lista de itens do menu
  const menuItems = [
    {
      id: "add",
      label: "Nova Planta",
      icon: <FiCamera size={20} />,
      color: "text-green-600 bg-green-100",
      action: onAddPlant,
    },
    {
      id: "ai",
      label: "Identificar IA",
      icon: <FiCpu size={20} />,
      color: "text-purple-600 bg-purple-100",
      action: onAddAI,
    },
    {
      id: "luz",
      label: filterLuz || "Luz",
      icon: <span className="text-lg">☀️</span>,
      color: filterLuz
        ? "text-yellow-700 bg-yellow-100"
        : "text-gray-600 bg-gray-100",
      isFilter: true,
    },
    {
      id: "rega",
      label: filterRega
        ? filterRega === "cacto"
          ? "Espaçada"
          : filterRega === "1gota"
            ? "Moderada"
            : "Frequente"
        : "Rega",
      icon: <span className="text-lg">💧</span>,
      color: filterRega
        ? "text-blue-700 bg-blue-100"
        : "text-gray-600 bg-gray-100",
      isFilter: true,
    },
    {
      id: "pet",
      label:
        filterPet === "sim"
          ? "Pet Friendly"
          : filterPet === "nao"
            ? "Tóxica"
            : "Pet",
      icon: <span className="text-lg">🐶</span>,
      color: filterPet
        ? "text-green-700 bg-green-100"
        : "text-gray-600 bg-gray-100",
      isFilter: true,
    },
    {
      id: "view",
      label: viewMode ? "Exibindo" : "Visualização",
      icon: <FiLayout size={20} />,
      color: viewMode
        ? "text-purple-700 bg-purple-100"
        : "text-gray-600 bg-gray-100",
      isFilter: true,
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <FiSettings size={20} />,
      color: "text-gray-600 bg-gray-100",
      action: onOpenSettings,
    },
    {
      id: "logout",
      label: "Sair",
      icon: <FiLogOut size={20} />,
      color: "text-red-600 bg-red-100",
      action: onLogout,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed bottom-8 right-8 z-50">
        {/* Items Container */}
        <div className="relative">
          {menuItems.map((item, index) => {
            // Cálculo da posição vertical (pilha acima do botão)
            const bottomOffset = (index + 1) * 65;

            return (
              <div
                key={item.id}
                className={`absolute right-0 bottom-0 flex flex-col items-end transition-all duration-300 ease-out`}
                style={{
                  transform: isOpen
                    ? `translateY(-${bottomOffset}px)`
                    : `translateY(0) scale(0.5)`,
                  opacity: isOpen ? 1 : 0,
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`hidden md:block text-white font-medium text-sm bg-black/50 px-2 py-1 rounded-md backdrop-blur-md shadow-sm whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0"}`}
                  >
                    {item.label}
                  </span>
                  <button
                    onClick={(e) => {
                      if (item.isFilter) {
                        e.stopPropagation();
                        setExpandedFilter(
                          expandedFilter === item.id ? null : item.id,
                        );
                      } else {
                        setIsOpen(false);
                        item.action();
                      }
                    }}
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${item.color}`}
                  >
                    {item.icon}
                  </button>
                </div>

                {/* Submenu de Filtros */}
                {item.isFilter && expandedFilter === item.id && (
                  <div className="absolute right-14 top-0">
                    {renderFilterOptions(item.id)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white text-3xl transition-all duration-300 ${
            isOpen
              ? "bg-gray-400 rotate-90"
              : "bg-green-600 hover:bg-green-700 hover:scale-105"
          }`}
        >
          {isOpen ? <FiX /> : <FiPlus />}
        </button>
      </div>
    </>
  );
}
