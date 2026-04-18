"use client";

import { useEffect } from "react";

/**
 * Hook para limpar estados quando componentes são desmontados
 * Útil para evitar memory leaks e states inconsistentes
 */
export function useCleanup(effect) {
  useEffect(() => {
    return () => {
      if (effect) effect();
    };
  }, [effect]);
}

/**
 * Hook para garantir que o estado seja resetado ao sair da view
 * @param {Object} states - objeto com pares chave:valor a serem resetados
 */
export function useResetOnUnmount(states = {}) {
  useEffect(() => {
    return () => {
      Object.entries(states).forEach(([key, value]) => {
        if (typeof value === "function") {
          value();
        }
      });
    };
  }, [states]);
}
