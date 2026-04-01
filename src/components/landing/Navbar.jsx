"use client";

import React from "react";
import Image from "next/image";
import { FiMenu, FiGrid } from "react-icons/fi";

const Navbar = ({ onLogin }) => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 glass rounded-2xl px-6 py-4 flex items-center justify-between animate-fade-in shadow-premium">
      <div className="flex items-center gap-2">
        <Image 
          src="/logo.png" 
          alt="MyPlants Logo" 
          width={32} 
          height={32} 
          className="rounded-lg shadow-sm"
        />
        <span className="font-heading text-xl font-bold tracking-tight text-primary-900">
          MyPlants
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">Gestão</a>
        <a href="#ia" className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">Saúde IA</a>
        <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">Preços</a>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onLogin}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20"
        >
          Entrar Agora
        </button>
        <button className="md:hidden text-primary-900">
          <FiMenu size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
