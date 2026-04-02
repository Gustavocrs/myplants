"use client";

import React from "react";
import Image from "next/image";
import { FiChevronRight, FiCheckCircle } from "react-icons/fi";

const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[100%] bg-radial from-primary-100/40 via-transparent to-transparent -z-10 blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl -z-10 animate-float"></div>

      <div className="mx-auto max-w-6xl text-center">
        {/* <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-primary-200 bg-primary-50/50 text-primary-800 text-sm font-bold mb-8 animate-fade-in shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
          Gestão Profissional para seu Jardim
        </div> */}

        <h1 className="font-heading text-3xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] text-neutral-900 mb-4 sm:mb-6 animate-slide-up mt-16 sm:mt-20">
          Controle seu jardim <br />
          com <span className="text-primary-500">inteligência</span>.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-neutral-600 mb-8 sm:mb-10 animate-fade-in delay-200">
          Gestão completa de regas, luz e saúde vegetal. O suporte da IA que você precisa para manter suas plantas vivas e vibrantes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 sm:mb-16 animate-slide-up delay-300">
          <button 
            onClick={onGetStarted}
            className="group flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary-500/30 w-full sm:w-auto justify-center"
          >
            Começar Grátis
            <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <a 
            href="#features"
            className="text-neutral-700 font-bold hover:text-primary-600 px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-2 transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            Ver como funciona
          </a>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-fade-in delay-500">
          {[
            "Gestão Completa de Jardim",
            "Saúde Vegetal Identificada por IA",
            "Lembretes Automáticos de Regas"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/50 p-4 rounded-2xl border border-white backdrop-blur-sm">
              <FiCheckCircle className="text-primary-500 shrink-0" size={24} />
              <span className="font-semibold text-neutral-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
