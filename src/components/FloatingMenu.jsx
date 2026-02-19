"use client";
import {useState} from "react";

export default function FloatingMenu({onAddPlant}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end z-40">
      {/* Menu Options */}
      <div
        className={`flex flex-col gap-3 mb-4 transition-all duration-200 origin-bottom ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <button
          onClick={() => {
            setIsOpen(false);
            onAddPlant();
          }}
          className="flex items-center gap-3 bg-white text-gray-700 px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <span className="font-medium">Adicionar Planta</span>
          <div className="bg-green-100 p-2 rounded-full text-green-600">🌱</div>
        </button>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white text-4xl pb-1 transition-all duration-300 ${
          isOpen
            ? "bg-gray-400 rotate-45"
            : "bg-green-600 hover:bg-green-700 hover:scale-105"
        }`}
      >
        +
      </button>
    </div>
  );
}
