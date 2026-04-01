"use client";

import React from "react";
import { FiCheck, FiX } from "react-icons/fi";

const PricingSection = ({ onGetStarted }) => {
  const plans = [
    {
      name: "Grátis",
      price: "R$ 0",
      desc: "Ideal para começar seu pequeno jardim.",
      features: [
        { text: "Até 5 plantas no jardim", active: true },
        { text: "Lembretes de rega básicos", active: true },
        { text: "Diagnóstico por IA limitado (3/mês)", active: true },
        { text: "Suporte prioritário", active: false },
        { text: "Histórico completo de saúde", active: false }
      ],
      buttonText: "Começar Agora",
      highlight: false
    },
    {
      name: "Pro",
      price: "R$ 9,90",
      period: "/mês",
      desc: "Para o tutor de plantas sério e apaixonado.",
      features: [
        { text: "Plantas ilimitadas", active: true },
        { text: "Lembretes inteligentes via push", active: true },
        { text: "Diagnóstico por IA ilimitado", active: true },
        { text: "Suporte prioritário", active: true },
        { text: "Histórico completo de saúde", active: true }
      ],
      buttonText: "Assinar Pro",
      highlight: true
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-4">Escolha seu <span className="text-primary-500">plano</span></h2>
          <p className="text-neutral-500">Transparência total para você focar no que importa: suas plantas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-8 rounded-3xl border-2 transition-all hover:scale-105 ${plan.highlight ? 'border-primary-500 bg-primary-50/10 shadow-premium' : 'border-neutral-100 bg-white'}`}
            >
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  Mais Popular
                </span>
              )}
              
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-neutral-900">{plan.price}</span>
                {plan.period && <span className="text-neutral-500 font-medium">{plan.period}</span>}
              </div>
              <p className="text-sm text-neutral-500 mb-8">{plan.desc}</p>

              <ul className="space-y-4 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    {f.active ? (
                      <FiCheck className="text-primary-500 shrink-0" size={18} />
                    ) : (
                      <FiX className="text-neutral-300 shrink-0" size={18} />
                    )}
                    <span className={f.active ? 'text-neutral-700 font-medium' : 'text-neutral-400 line-through'}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={onGetStarted}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${plan.highlight ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
