"use client";
import {useState, useEffect} from "react";
import {api} from "../services/api";
import {useAuth} from "@/context/AuthContext";

export default function SettingsModal({onClose}) {
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general | email | profile
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [massUpdateLoading, setMassUpdateLoading] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    isPublic: false,
    displayName: "",
    emailNotificationsEnabled: true,
    geminiApiKey: "",
    smtp: {
      host: "",
      port: 587,
      user: "",
      pass: "",
      secure: false,
      fromEmail: "",
    },
    savedViews: [],
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings(user.uid);
      if (data) {
        setFormData({
          slug: data.slug || "",
          isPublic: !!data.isPublic,
          displayName: data.displayName || user.displayName || "",
          emailNotificationsEnabled:
            data.emailNotificationsEnabled !== undefined
              ? data.emailNotificationsEnabled
              : true,
          geminiApiKey: data.geminiApiKey || "",
          smtp: {
            host: data.smtp?.host || "smtp.gmail.com",
            port: data.smtp?.port || 587,
            user: data.smtp?.user || user.email || "",
            pass: data.smtp?.pass || "",
            secure: data.smtp?.secure !== undefined ? data.smtp.secure : false,
            fromEmail: data.smtp?.fromEmail || user.email || "",
          },
          savedViews: data.savedViews || [],
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.saveSettings(user.uid, formData);
      alert("Configurações salvas com sucesso!");
      onClose();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      // Salva antes de testar para garantir que o backend use os dados mais recentes
      await api.saveSettings(user.uid, formData);
      await api.testNotification(user.uid, user.email);
      alert(
        `E-mail de teste enviado para ${user.email}! Verifique sua caixa de entrada (e spam).`,
      );
    } catch (error) {
      alert("Erro no teste: " + error.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleMassUpdate = async (field, value) => {
    if (!confirm("Tem certeza? Isso afetará TODAS as suas plantas.")) return;

    try {
      setMassUpdateLoading(true);
      const token = await user.getIdToken(); // Se precisar de auth header, mas aqui estamos usando body userId por simplicidade na API atual

      // Usando fetch direto pois api.js não tem o método batchUpdate exposto explicitamente no contexto
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/plants/batch`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            updates: {[field]: value},
          }),
        },
      );

      if (!response.ok) throw new Error("Falha na atualização em massa");
      alert("Plantas atualizadas com sucesso!");
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setMassUpdateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      <div className="w-full max-w-3xl mx-auto h-full flex flex-col bg-white">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === "general" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("general")}
            title="Inteligência Artificial"
          >
            <span className="text-xl">🤖</span>{" "}
            <span className="hidden md:inline ml-1">IA</span>
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === "email" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("email")}
            title="Notificações"
          >
            <span className="text-xl">📧</span>{" "}
            <span className="hidden md:inline ml-1">Email</span>
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === "profile" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("profile")}
            title="Perfil Público"
          >
            <span className="text-xl">🌍</span>{" "}
            <span className="hidden md:inline ml-1">Perfil</span>
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === "plants" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("plants")}
            title="Gerenciar Plantas"
          >
            <span className="text-xl">🌿</span>{" "}
            <span className="hidden md:inline ml-1">Plantas</span>
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === "views" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("views")}
            title="Modos de Visualização"
          >
            <span className="text-xl">👁️</span>{" "}
            <span className="hidden md:inline ml-1">Vistas</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave da API do Gemini (Google)
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={formData.geminiApiKey}
                    onChange={(e) =>
                      setFormData({...formData, geminiApiKey: e.target.value})
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none pr-10"
                    placeholder="Ex: AIzaSy..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title={showGeminiKey ? "Ocultar chave" : "Exibir chave"}
                  >
                    {showGeminiKey ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para usar a chave padrão do sistema (se
                  disponível).
                  <br />
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    className="text-green-600 hover:underline"
                  >
                    Obter chave aqui
                  </a>
                </p>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    Ativar notificações por e-mail
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotificationsEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailNotificationsEnabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servidor SMTP (Host)
                  </label>
                  <input
                    type="text"
                    value={formData.smtp.host}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: {...formData.smtp, host: e.target.value},
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={formData.smtp.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: {...formData.smtp, port: Number(e.target.value)},
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="587"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={formData.smtp.secure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: {...formData.smtp, secure: e.target.checked},
                      })
                    }
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="secure"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Usar SSL/TLS
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Remetente
                  </label>
                  <input
                    type="email"
                    value={formData.smtp.fromEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: {...formData.smtp, fromEmail: e.target.value},
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário SMTP
                  </label>
                  <input
                    type="text"
                    value={formData.smtp.user}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: {...formData.smtp, user: e.target.value},
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? "text" : "password"}
                      value={formData.smtp.pass}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtp: {...formData.smtp, pass: e.target.value},
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showSmtpPass ? "Ocultar senha" : "Exibir senha"}
                    >
                      {showSmtpPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                ⚠️ Nota: Para Gmail, é necessário usar uma "Senha de App" para
                garantir a segurança e o funcionamento correto.
                <br />
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline font-medium"
                >
                  Gerar Senha de App aqui ↗
                </a>
              </p>

              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail || loading}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {testingEmail
                    ? "Enviando..."
                    : "📨 Enviar e-mail de teste para mim"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p>
                  Compartilhe sua coleção de plantas com amigos! Ao ativar o
                  perfil público, qualquer pessoa com o link poderá ver suas
                  plantas (apenas leitura).
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  Ativar Perfil Público
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({...formData, isPublic: e.target.checked})
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {formData.isPublic && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({...formData, displayName: e.target.value})
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Ex: Jardim do Gustavo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link do Perfil (Slug)
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500 text-sm">
                        {typeof window !== "undefined"
                          ? window.location.host
                          : ""}
                        /
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        className="w-full border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="meu-jardim"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas letras minúsculas, números e hífens.
                    </p>
                  </div>

                  {formData.slug && (
                    <div className="pt-2">
                      <a
                        href={`/${formData.slug}`}
                        target="_blank"
                        className="text-green-600 hover:underline text-sm flex items-center gap-1"
                      >
                        🔗 Visualizar meu perfil público
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "plants" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                <p>
                  ⚠️ <strong>Atenção:</strong> As ações abaixo aplicam
                  configurações para <strong>todas</strong> as suas plantas de
                  uma vez. Esta ação não pode ser desfeita facilmente.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Notificações</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMassUpdate("lembretesAtivos", true)}
                    disabled={massUpdateLoading}
                    className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    🔔 Ativar para todas
                  </button>
                  <button
                    onClick={() => handleMassUpdate("lembretesAtivos", false)}
                    disabled={massUpdateLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    🔕 Desativar para todas
                  </button>
                </div>

                <h3 className="font-medium text-gray-800 pt-4">
                  Outras Configurações
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMassUpdate("petFriendly", true)}
                    disabled={massUpdateLoading}
                    className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    🐶 Marcar todas como Pet Friendly
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "views" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Gerencie seus modos de visualização salvos. Você pode criar
                novos modos na tela inicial aplicando filtros e clicando em
                "Salvar Filtros".
              </p>

              {formData.savedViews.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg">
                  Nenhum modo de visualização salvo.
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.savedViews.map((view, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div>
                        <span className="font-medium text-gray-800">
                          {view.name}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {[
                            view.filters.luz,
                            view.filters.rega,
                            view.filters.pet,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "Sem filtros"}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            savedViews: prev.savedViews.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                        className="text-red-500 hover:text-red-700 text-sm px-2"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
