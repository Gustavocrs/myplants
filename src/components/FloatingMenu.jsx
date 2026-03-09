"use client";
import {useState, useEffect} from "react";
import {
  FiCamera,
  FiCpu,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiX,
  FiFilter,
  FiHome,
  FiEdit3,
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
      <div className="grid grid-cols-4 gap-2 mt-2 px-2 animate-in slide-in-from-top-2 fade-in duration-200">
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
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all aspect-square ${
              currentValue === opt.value
                ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
            }`}
            title={opt.label}
          >
            <span className="text-lg leading-none mb-1">{opt.icon}</span>
            <span className="text-[9px] font-bold uppercase leading-none text-center">
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
      color: "text-white bg-green-500 shadow-green-200",
      action: onAddPlant,
    },
    {
      id: "ai",
      label: "Identificar IA",
      icon: <FiCpu size={20} />,
      color: "text-white bg-purple-500 shadow-purple-200",
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
      {/* Menu Full Screen Overlay */}
      <div
        className={`
          fixed inset-0 bg-white/80 backdrop-blur-xl z-40 
          flex flex-col justify-center items-center
          transition-all duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      >
        <div
          className="w-full max-w-md px-6 flex flex-col gap-3 max-h-screen overflow-y-auto py-20"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item) => (
            <div key={item.id} className="w-full">
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
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border ${
                  item.isFilter && expandedFilter === item.id
                    ? "bg-gray-50 border-gray-200 shadow-inner scale-[0.98]"
                    : "bg-white border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-lg ${item.color}`}
                >
                  {item.icon}
                </div>
                <span className="font-bold text-gray-700 flex-1 text-left text-lg">
                  {item.label}
                </span>
                {item.isFilter && (
                  <span className="text-gray-400 text-xs">
                    {expandedFilter === item.id ? "▲" : "▼"}
                  </span>
                )}
              </button>

              {item.isFilter && expandedFilter === item.id && (
                <div className="pb-2">{renderFilterOptions(item.id)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAB Button Container */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-2xl shadow-2xl shadow-green-300 flex items-center justify-center text-white text-3xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            isOpen
              ? "bg-gray-800 rotate-90 rounded-full"
              : "bg-gradient-to-br from-green-500 to-emerald-600"
          }`}
        >
          {isOpen ? <FiX /> : <FiPlus />}
        </button>
      </div>
    </>
  );
}
