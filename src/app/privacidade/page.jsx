"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiLock, FiEye, FiServer } from "react-icons/fi";

const PrivacidadePage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-20 font-body">
      <div className="mx-auto max-w-3xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary-600 font-bold mb-12 hover:translate-x-1 transition-transform font-bold"
        >
          <FiArrowLeft /> Voltar para Home
        </Link>
        
        <h1 className="font-heading text-4xl font-black text-neutral-900 mb-8">Política de Privacidade</h1>
        
        <div className="bg-white p-10 rounded-3xl border border-neutral-100 shadow-sm space-y-6 text-neutral-600 leading-relaxed">
          <p>Sua privacidade é nossa prioridade. No <strong>MyPlants</strong>, coletamos apenas o necessário para garantir o melhor cuidado para seu jardim.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
              <FiLock className="mx-auto text-primary-500 mb-3" size={24} />
              <h3 className="text-xs font-bold text-neutral-900 uppercase">Segurança</h3>
              <p className="text-[10px] opacity-70">Dados criptografados de ponta a ponta.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
              <FiEye className="mx-auto text-primary-500 mb-3" size={24} />
              <h3 className="text-xs font-bold text-neutral-900 uppercase">Transparência</h3>
              <p className="text-[10px] opacity-70">Você sempre no controle do que compartilhamos.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
              <FiServer className="mx-auto text-primary-500 mb-3" size={24} />
              <h3 className="text-xs font-bold text-neutral-900 uppercase">Respeito</h3>
              <p className="text-[10px] opacity-70">Não vendemos seus dados para terceiros.</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900">1. Coleta de Dados</h2>
          <p>Utilizamos o Google OAuth para autenticação. Coletamos seu e-mail e nome publicamente vinculado para identificação no sistema. Não acessamos outras informações da sua conta Google sem permissão explícita.</p>

          <h2 className="text-xl font-bold text-neutral-900">2. Uso de Imagens</h2>
          <p>As fotos de plantas enviadas para diagnóstico por IA são processadas via <strong>Google Gemini Pro Vision</strong>. Essas imagens são mantidas em um bucket seguro para garantir seu histórico pessoal.</p>

          <h2 className="text-xl font-bold text-neutral-900">3. LGPD e Seus Direitos</h2>
          <p>Como usuário, você tem direito a solicitar a exclusão de todos os seus dados a qualquer momento. Basta entrar em contato através do e-mail de suporte (gustavocrsilva.ti@gmail.com).</p>

          <hr className="my-8 border-neutral-100" />
          <p className="text-sm font-medium">Última atualização: 31 de Março de 2026</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacidadePage;
