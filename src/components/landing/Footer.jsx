"use client";

import React from "react";
import Image from "next/image";
import { FiLinkedin, FiGithub, FiMail } from "react-icons/fi";


const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-neutral-200">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Image 
              src="/logo.png" 
              alt="MyPlants Logo" 
              width={24} 
              height={24} 
              className="rounded-md"
            />
            <span className="font-heading text-lg font-extrabold text-primary-900 tracking-tighter">MyPlants</span>
          </div>
          <p className="text-sm text-neutral-500 max-w-xs mx-auto md:mx-0">
            Cuidado inteligente para o seu jardim urbano. Made with ❤️ for Nature.
          </p>
        </div>

        <div className="col-span-1">
          <h4 className="font-bold text-neutral-900 mb-6 uppercase text-xs tracking-widest">Produto</h4>
          <ul className="space-y-4">
            <li><a href="#features" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Gestão</a></li>
            <li><a href="#ia" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Saúde IA</a></li>
            <li><a href="#pricing" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Preços</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="font-bold text-neutral-900 mb-6 uppercase text-xs tracking-widest">Suporte</h4>
          <ul className="space-y-4">
            <li><a href="mailto:gustavocrsilva.ti@gmail.com" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">gustavocrsilva.ti@gmail.com</a></li>
            <li><a href="/termos" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Termos de Uso</a></li>
            <li><a href="/privacidade" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Privacidade</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="font-bold text-neutral-900 mb-6 uppercase text-xs tracking-widest">Social</h4>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <a href="https://linkedin.com/in/gustavocrsilva" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm">
              <FiLinkedin />
            </a>
            <a href="https://github.com/gustavocrs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm">
              <FiGithub />
            </a>
            <a href="mailto:gustavocrsilva.ti@gmail.com" className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm">
              <FiMail />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-16 pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs text-neutral-400 font-medium">© 2026 MyPlants. Todos os direitos reservados.</span>
        <span className="text-xs text-neutral-300 font-bold tracking-widest">SYSTECH ECOSYSTEM</span>
      </div>
    </footer>
  );
};

export default Footer;
