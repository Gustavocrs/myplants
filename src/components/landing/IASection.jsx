"use client";

import React from "react";
import { FiCpu, FiCamera, FiAlertCircle, FiSearch } from "react-icons/fi";

const IASection = () => {
  const iaFeatures = [
    {
      icon: <FiCamera />,
      title: "Identificação Rápida",
      desc: "Tire uma foto e receba informações botânicas imediatas sobre sua planta."
    },
    {
      icon: <FiCpu />,
      title: "Saúde IA",
      desc: "Detecte padrões de rega e luz que podem ser otimizados para cada espécie."
    },
    {
      icon: <FiSearch />,
      title: "Diagnóstico Preventivo",
      desc: "Identifique problemas comuns antes que eles afetem a vida da sua planta."
    }
  ];

  return (
    <section id="ia" className="py-24 px-6 bg-neutral-50 overflow-hidden relative">
      {/* Glow Effect */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-100/30 rounded-full blur-[120px] -z-10"></div>
      
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-widest mb-6">
              Tecnologia de Apoio
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-900 mb-6 font-heading">
              Inteligência que <span className="text-primary-500">potencializa</span> o seu cuidado.
            </h2>
            <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
              O MyPlants coloca o controle do jardim nas suas mãos. A nossa IA atua como um assistente botânico especializado, fornecendo dados precisos para que suas decisões de cuidado sejam sempre as melhores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {iaFeatures.map((f, i) => (
                <div key={i} className="group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-500 mb-4 shadow-md group-hover:bg-primary-500 group-hover:text-white transition-all">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-neutral-100 relative z-10 animate-float translate-x-4">
              <div className="w-full aspect-[4/5] bg-neutral-100 rounded-[2rem] overflow-hidden flex items-center justify-center border border-neutral-200">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch size={40} />
                  </div>
                  <h4 className="font-bold text-lg text-neutral-900 mb-2 font-heading">Análise em tempo real</h4>
                  <p className="text-sm text-neutral-500">Aponte sua câmera para ver o diagnóstico completo.</p>
                </div>
              </div>
            </div>
            {/* Visual elements */}
            <div className="absolute -bottom-10 -left-10 bg-accent-400 p-8 rounded-3xl text-white shadow-2xl z-20 max-w-[200px] animate-slide-up">
              <FiAlertCircle size={32} className="mb-4" />
              <p className="font-bold text-sm">Status: Solo seco detectado.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IASection;
