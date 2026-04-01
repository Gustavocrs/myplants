"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const TermosPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-20 font-body">
      <div className="mx-auto max-w-3xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary-600 font-bold mb-12 hover:translate-x-1 transition-transform"
        >
          <FiArrowLeft /> Voltar para Home
        </Link>
        
        <h1 className="font-heading text-4xl font-black text-neutral-900 mb-8">Termos de Uso</h1>
        
        <div className="bg-white p-10 rounded-3xl border border-neutral-100 shadow-sm space-y-6 text-neutral-600 leading-relaxed">
          <p>Bem-vindo ao <strong>MyPlants</strong>. Ao acessar este serviço, você concorda em cumprir estes termos de uso.</p>
          
          <h2 className="text-xl font-bold text-neutral-900 mt-8">1. Uso do Serviço</h2>
          <p>O MyPlants é uma ferramenta de gestão e diagnóstico botânico. Você concorda em utilizar o sistema de forma ética e legal, respeitando os limites da sua assinatura e não realizando abusos no uso da inteligência artificial.</p>

          <h2 className="text-xl font-bold text-neutral-900 mt-8">2. Dados do Usuário</h2>
          <p>Utilizamos autenticação Google para garantir a segurança das suas plantas e dados. Não compartilhamos informações sensíveis com terceiros sem sua autorização explícita.</p>

          <h2 className="text-xl font-bold text-neutral-900 mt-8">3. Limitações de Responsabilidade</h2>
          <p>O diagnóstico por IA é uma ferramenta de apoio. O MyPlants não se responsabiliza por decisões tomadas com base em análises automáticas que resultem em danos às plantas. Sempre verifique as condições reais antes de agir.</p>

          <h2 className="text-xl font-bold text-neutral-900 mt-8">4. Assinaturas e Cancelamentos</h2>
          <p>O plano Grátis possui limitações técnicas. O plano Pro pode ser cancelado a qualquer momento, mantendo os benefícios até o fim do ciclo de faturamento atual.</p>

          <hr className="my-8 border-neutral-100" />
          <p className="text-sm font-medium">Última atualização: 31 de Março de 2026</p>
          <p className="text-sm">Dúvidas: <a href="mailto:gustavocrsilva.ti@gmail.com" className="text-primary-500 font-bold underline">gustavocrsilva.ti@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default TermosPage;
