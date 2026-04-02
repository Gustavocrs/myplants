"use client";

import React from "react";
import Image from "next/image";
import { FiPlay } from "react-icons/fi";

const CtaSection = ({ onGetStarted }) => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 sm:w-80 h-60 sm:h-80 bg-primary-500/20 rounded-full blur-3xl -z-10 animate-float"></div>
      
      <div className="mx-auto max-w-4xl bg-primary-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center text-white shadow-2xl relative">
        <Image 
          src="/logo.png" 
          alt="MyPlants Logo" 
          width={48} 
          height={48} 
          className="mx-auto mb-6 sm:mb-8 rounded-2xl shadow-premium border-2 border-primary-800"
        />
        
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Sua jornada verde começa agora.
        </h2>
        <p className="text-primary-100 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto opacity-80">
          Gerencie até 5 plantas gratuitamente e experimente o diagnóstico por IA sem compromisso.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onGetStarted}
            className="group flex items-center gap-3 bg-white text-primary-900 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl hover:bg-primary-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10 w-full sm:w-auto justify-center"
          >
            Entrar com Google
            <FiPlay className="text-primary-500 group-hover:scale-125 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
