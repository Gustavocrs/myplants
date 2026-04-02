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
    <div className="space-y-4 font-body">
      {/* Header */}
      <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-white text-primary-600 rounded-lg flex items-center justify-center shrink-0 text-lg shadow-sm">
          💧
        </div>
        <div>
          <h3 className="font-heading font-semibold text-neutral-900">Status de Hidratação</h3>
          <p className="text-sm text-neutral-500">Acompanhe e atualize a rega de suas plantas.</p>
        </div>
      </div>

      {/* Plants list */}
      <div className="space-y-3">
        {plants.length === 0 ? (
          <div className="p-10 text-center bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-neutral-400 font-medium">Nenhuma planta cadastrada.</p>
          </div>
        ) : (
          plants.map((plant) => (
            <div
              key={plant.id || plant._id}
              className="bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-sm transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-3 flex-1 w-full">
                {/* Plant image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                  {plant.imagemUrl ? (
                    <img
                      src={plant.imagemUrl}
                      alt={plant.nome || "Planta"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      🌱
                    </div>
                  )}
                </div>

                {/* Plant info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-medium text-neutral-900 text-sm truncate">
                    {plant.nome || plant.nomeCientifico || "Planta sem nome"}
                  </h4>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <FiCalendar size={12} />
                      Última: {plant.ultimaRega ? new Date(plant.ultimaRega).toLocaleDateString("pt-BR") : "---"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                      <FiDroplet size={12} />
                      Próxima: {getNextWateringDate(plant.ultimaRega, plant.intervaloRega)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Water button */}
              <button
                onClick={() => handleWater(plant)}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 shadow-sm transition-all hover:shadow active:scale-[0.98] flex items-center justify-center gap-2 text-sm rounded-lg"
              >
                <FiCheckCircle size={16} />
                <span>Regar</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
