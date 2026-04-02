"use client";

import React from "react";
import { FiGrid, FiCpu, FiDroplet, FiAward } from "react-icons/fi";

const FeaturesSection = () => {
  const features = [
    {
      icon: <FiGrid size={32} />,
      title: "Gestão Inteligente",
      desc: "Organize seu jardim urbano de forma visual e intuitiva com cards interativos."
    },
    {
      icon: <FiCpu size={32} />,
      title: "Diagnóstico por IA",
      desc: "Tire uma foto e receba alertas sobre a saúde da sua planta em segundos."
    },
    {
      icon: <FiDroplet size={32} />,
      title: "Lembretes Automáticos",
      desc: "Nunca mais esqueça de regar suas plantas com notificações personalizadas."
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-neutral-900 border-y border-neutral-800">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white mb-4 animate-fade-in">
            Tudo o que você precisa para <span className="text-primary-400">florescer</span>.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Combinamos a sabedoria da natureza com a precisão da inteligência artificial para que você se torne o tutor que suas plantas merecem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="bg-neutral-800 p-6 sm:p-10 rounded-3xl border border-neutral-700 hover:border-primary-500 transition-all hover:scale-105 active:scale-95 group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 mb-4 sm:mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all">
                {f.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mb-3 sm:mb-4">{f.title}</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
