"use client";

import React from "react";
import { FiDroplet, FiCalendar, FiCheckCircle } from "react-icons/fi";

export default function WateringStatus({plants = [], onUpdateWatering}) {
  const getNextWateringDate = (ultimaRega, intervaloRega) => {
    if (!ultimaRega || !intervaloRega) return "Não configurado";
    const date = new Date(ultimaRega);
    date.setDate(date.getDate() + Number(intervaloRega));
    return date.toLocaleDateString("pt-BR");
  };

  const handleWater = (plant) => {
    const today = new Date().toISOString();
    if (onUpdateWatering) {
      onUpdateWatering(plant.id || plant._id, today);
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="glass p-6 rounded-2xl border border-primary-100 flex items-center gap-4 animate-fade-in shadow-sm">
        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/10 text-xl">
          💧
        </div>
        <div>
          <h3 className="font-heading font-black text-neutral-900 tracking-tight">Status de Hidratação</h3>
          <p className="text-sm text-neutral-500">Acompanhe e atualize a rega de suas plantas em tempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plants.length === 0 ? (
          <div className="p-12 text-center glass rounded-3xl border border-neutral-100">
            <p className="text-neutral-400 font-medium italic">Nenhuma planta cadastrada para exibir o status.</p>
          </div>
        ) : (
          plants.map((plant) => (
            <div
              key={plant.id || plant._id}
              className="glass p-5 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-premium transition-all group flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden bg-neutral-100 shrink-0 border-2 border-white shadow-sm">
                  {plant.imagemUrl ? (
                    <img
                      src={plant.imagemUrl}
                      alt={plant.nome || "Planta"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🌱
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-heading font-black text-neutral-900 tracking-tight text-lg mb-1">
                    {plant.nome || plant.nomeCientifico || "Planta sem nome"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      <FiCalendar size={12} className="text-primary-500" />
                      Última: {plant.ultimaRega ? new Date(plant.ultimaRega).toLocaleDateString("pt-BR") : "---"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-secondary-600 uppercase tracking-widest bg-secondary-100 px-2.5 py-1 rounded-lg">
                      <FiDroplet size={12} />
                      Próxima: {getNextWateringDate(plant.ultimaRega, plant.intervaloRega)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleWater(plant)}
                className="w-full md:w-auto bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <FiCheckCircle size={18} />
                <span>Regar Agora</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
