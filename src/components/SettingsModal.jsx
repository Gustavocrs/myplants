"use client";
import {useState, useEffect} from "react";
import {api} from "../services/api";
import {useAuth} from "@/context/AuthContext";
import WateringStatus from "./WateringStatus";

export default function SettingsModal({onClose, plants = [], onPlantsUpdate}) {
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general | email | profile
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [massUpdateLoading, setMassUpdateLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    message: "",
    isError: false,
    onCloseAlert: null,
  });
  const [hostName, setHostName] = useState("");

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
    setHostName(globalThis.location?.host || "");
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
      setAlertDialog({
        isOpen: true,
        message: "Configurações salvas com sucesso!",
        isError: false,
        onCloseAlert: () => onClose(),
      });
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        message: "Erro ao salvar: " + error.message,
        isError: true,
      });
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
      setAlertDialog({
        isOpen: true,
        message: `E-mail de teste enviado para ${user.email}! Verifique sua caixa de entrada (e spam).`,
        isError: false,
      });
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        message: "Erro no teste: " + error.message,
        isError: true,
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleMassUpdate = (field, value) => {
    setConfirmDialog({
      isOpen: true,
      message: "Tem certeza? Isso afetará TODAS as suas plantas.",
      onConfirm: async () => {
        setConfirmDialog({isOpen: false, message: "", onConfirm: null});
        try {
          setMassUpdateLoading(true);
          const token = await user.getIdToken();

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/plants/batch`,
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
          setAlertDialog({
            isOpen: true,
            message: "Plantas atualizadas com sucesso!",
            isError: false,
          });
        } catch (error) {
          setAlertDialog({
            isOpen: true,
            message: "Erro: " + error.message,
            isError: true,
          });
        } finally {
          setMassUpdateLoading(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 h-[90vh] flex flex-col font-body overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-10 border-b border-neutral-100 flex justify-between items-center bg-white/50">
          <h2 className="text-3xl font-black text-neutral-900 font-heading tracking-tight">Configurações</h2>
          <button
            onClick={onClose}
            className="text-neutral-900 hover:text-primary-600 p-3 hover:bg-neutral-100 rounded-2xl transition-all"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
        </div>

        <div className="flex bg-neutral-50/50 p-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            className={`flex-1 min-w-[100px] py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "general" ? "bg-white text-primary-900 shadow-premium" : "text-neutral-400 hover:text-neutral-600 hover:bg-white/50"}`}
            onClick={() => setActiveTab("general")}
          >
            <span>🤖 IA</span>
          </button>
          <button
            className={`flex-1 min-w-[100px] py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "email" ? "bg-white text-primary-900 shadow-premium" : "text-neutral-400 hover:text-neutral-600 hover:bg-white/50"}`}
            onClick={() => setActiveTab("email")}
          >
            <span>📧 Email</span>
          </button>
          <button
            className={`flex-1 min-w-[100px] py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "profile" ? "bg-white text-primary-900 shadow-premium" : "text-neutral-400 hover:text-neutral-600 hover:bg-white/50"}`}
            onClick={() => setActiveTab("profile")}
          >
            <span>🌍 Perfil</span>
          </button>
          <button
            className={`flex-1 min-w-[100px] py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "watering" ? "bg-white text-primary-900 shadow-premium" : "text-neutral-400 hover:text-neutral-600 hover:bg-white/50"}`}
            onClick={() => setActiveTab("watering")}
          >
            <span>💧 Rega</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Chave da API do Gemini (Google AI)
                </label>
                <div className="relative group">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={formData.geminiApiKey}
                    onChange={(e) =>
                      setFormData({...formData, geminiApiKey: e.target.value})
                    }
                    className="w-full bg-white border border-neutral-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all shadow-sm font-medium pr-12"
                    placeholder="AIzaSy..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-600"
                  >
                    {showGeminiKey ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 mt-4">
                  <p className="text-xs text-primary-800 font-medium leading-relaxed">
                    Personalize o motor de inteligência artificial. Deixe em branco para usar a infraestrutura padrão do MyPlants.
                    <br />
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      className="inline-block mt-2 font-bold hover:underline"
                    >
                      Gerar minha própria chave gratuita ↗
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-8 animate-fade-in max-w-2xl">
              <div className="bg-neutral-50/50 p-6 rounded-[2rem] border border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-900 font-bold block">
                      Notificações Ativas
                    </span>
                    <span className="text-xs text-neutral-400">Receba avisos de rega diretamente no seu e-mail.</span>
                  </div>
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
                    <div className="w-14 h-8 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500 shadow-inner"></div>
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
                        {hostName}/
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

          {/* {activeTab === "plants" && (
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
          )} */}

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

          {activeTab === "watering" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <WateringStatus
                plants={plants}
                onUpdateWatering={async (plantId, novaData) => {
                  try {
                    setLoading(true);
                    await api.updatePlant(plantId, {
                      ultimaRega: novaData,
                      notificationSent: false,
                    });
                    if (onPlantsUpdate) onPlantsUpdate();
                  } catch (error) {
                    setAlertDialog({
                      isOpen: true,
                      message: "Erro ao atualizar a rega.",
                      isError: true,
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="p-8 border-t border-neutral-100 flex justify-end gap-4 bg-white/50">
          <button
            onClick={onClose}
            className="px-8 py-4 text-neutral-400 font-bold hover:text-neutral-600 transition-all text-sm uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-10 py-4 bg-primary-900 text-white rounded-2xl shadow-xl shadow-primary-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 font-bold text-sm border-2 border-white/10"
          >
            {loading ? "Processando..." : "Salvar Configurações"}
          </button>
        </div>

        {/* Modal Customizado de Confirmação */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Confirmar Ação
              </h3>
              <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: false,
                      message: "",
                      onConfirm: null,
                    })
                  }
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Customizado de Alerta (Sucesso/Erro) */}
        {alertDialog.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
              <h3
                className={`text-lg font-bold mb-2 ${alertDialog.isError ? "text-red-600" : "text-gray-800"}`}
              >
                {alertDialog.isError ? "Erro" : "Sucesso"}
              </h3>
              <p className="text-gray-600 mb-6">{alertDialog.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const callback = alertDialog.onCloseAlert;
                    setAlertDialog({
                      isOpen: false,
                      message: "",
                      isError: false,
                      onCloseAlert: null,
                    });
                    if (callback) callback();
                  }}
                  className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${alertDialog.isError ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
