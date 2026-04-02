"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ onLogin }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between animate-fade-in shadow-premium">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="MyPlants Logo" 
            width={28} 
            height={28} 
            className="rounded-lg shadow-sm"
          />
          <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-primary-900">
            MyPlants
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">Gestão</a>
          <a href="#ia" className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">Saúde IA</a>
          <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">Preços</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onLogin}
            className="hidden sm:block bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20"
          >
            Entrar Agora
          </button>
          <button 
            className="md:hidden text-primary-900 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-neutral-50 pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6">
            <a 
              href="#features" 
              className="text-xl font-semibold text-neutral-900 py-3 border-b border-neutral-200"
              onClick={() => setMenuOpen(false)}
            >
              Gestão
            </a>
            <a 
              href="#ia" 
              className="text-xl font-semibold text-neutral-900 py-3 border-b border-neutral-200"
              onClick={() => setMenuOpen(false)}
            >
              Saúde IA
            </a>
            <a 
              href="#pricing" 
              className="text-xl font-semibold text-neutral-900 py-3 border-b border-neutral-200"
              onClick={() => setMenuOpen(false)}
            >
              Preços
            </a>
            <button 
              onClick={() => {
                onLogin();
                setMenuOpen(false);
              }}
              className="mt-4 bg-primary-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
            >
              Entrar Agora
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
