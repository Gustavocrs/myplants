// contexts/AuthContext.js
"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {auth} from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se o usuário retornou de um login por redirecionamento (comum em mobile)
    getRedirectResult(auth).catch((error) => {
      console.error("Erro ao processar retorno do login:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Tenta popup primeiro (já que funcionou no modo desktop)
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no popup, tentando redirect:", error);
      // Fallback: Se o popup falhar (bloqueador), tenta redirecionamento
      try {
        await signInWithRedirect(auth, new GoogleAuthProvider());
      } catch (redirectError) {
        console.error("Erro final no login:", redirectError);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{user, loginGoogle, logout, loading}}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
