"use client";

import {useState} from "react";
import {getApp} from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {api} from "../../services/api";
import {useAuth} from "../../context/AuthContext";

export default function MigrationPage() {
  const {user} = useAuth();
  const [status, setStatus] = useState("Aguardando início...");
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  const handleMigrate = async () => {
    if (!user) {
      alert("Por favor, faça login antes de migrar.");
      return;
    }

    if (
      !confirm(
        "Isso vai ler os dados do Firebase e salvar no MongoDB. Continuar?",
      )
    ) {
      return;
    }

    try {
      setStatus("Conectando ao Firestore...");

      // Obtém a instância do Firebase já inicializada no projeto
      const app = getApp();
      const db = getFirestore(app);

      // Busca apenas as plantas do usuário logado para evitar erro de permissão
      const q = query(
        collection(db, "plants"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const total = querySnapshot.size;

      if (total === 0) {
        setStatus("Nenhuma planta encontrada no Firebase.");
        return;
      }

      addLog(`Encontradas ${total} plantas. Iniciando migração...`);
      let count = 0;
      let errors = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const fbData = docSnapshot.data();

        // Normaliza o campo de luz para evitar erro de validação do Mongoose
        const validLuz = ["Sombra", "Meia-sombra", "Luz Difusa", "Sol Pleno"];
        let luz = fbData.luz || "Meia-sombra";
        if (!validLuz.includes(luz)) {
          // Tenta encontrar ignorando maiúsculas/minúsculas ou usa padrão
          const found = validLuz.find(
            (v) => v.toLowerCase() === luz.toLowerCase(),
          );
          luz = found || "Meia-sombra";
        }

        // Prepara o objeto para o novo formato (MongoDB)
        const plantData = {
          nome: fbData.nome || fbData.name || "Sem Nome", // Garante compatibilidade de nomes
          nomeCientifico: fbData.nomeCientifico,
          apelido: fbData.apelido,
          luz: luz,
          intervaloRega: Number(fbData.intervaloRega) || 7,
          petFriendly: !!fbData.petFriendly,
          imagemUrl: fbData.imageUrl || fbData.imagemUrl, // Compatibilidade de campos
          observacoes: fbData.observacoes,
          userId: fbData.userId || user.uid, // Mantém o dono original ou atribui ao atual

          // Converte Timestamps do Firestore para Date do JS
          ultimaRega: fbData.ultimaRega?.toDate
            ? fbData.ultimaRega.toDate()
            : new Date(),
          dataAquisicao: fbData.dataAquisicao?.toDate
            ? fbData.dataAquisicao.toDate()
            : new Date(),
          createdAt: fbData.createdAt?.toDate
            ? fbData.createdAt.toDate()
            : new Date(),
        };

        try {
          await api.createPlant(plantData);
          count++;
          addLog(`✅ [${count}/${total}] Migrado: ${plantData.nome}`);
        } catch (err) {
          console.error(err);
          errors++;
          addLog(`❌ Erro ao migrar ${plantData.nome}: ${err.message}`);
        }
      }

      setStatus(`Finalizado! Sucesso: ${count}, Erros: ${errors}`);
    } catch (error) {
      console.error("Erro geral:", error);
      setStatus(`Erro fatal: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-green-800">
          Migração de Dados 🔄
        </h1>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p>
            ⚠️ <strong>Atenção:</strong> Esta ferramenta copia os dados do
            Firebase para o seu novo banco MongoDB.
          </p>
          <p>Certifique-se de estar logado com o usuário correto.</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleMigrate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Iniciar Migração
          </button>
          <a href="/" className="text-gray-600 py-2 px-4 hover:underline">
            Voltar para Home
          </a>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
          <div className="mb-2 border-b border-gray-700 pb-2 text-white">
            Status: {status}
          </div>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
