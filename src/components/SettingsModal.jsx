"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { api } from "../services/api";
import WateringStatus from "./WateringStatus";

export default function SettingsModal({
  onClose,
  plants = [],
  onPlantsUpdate,
}) {
  useEscapeKey(onClose);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
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
        setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
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
                updates: { [field]: value },
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

  const tabs = [
    { id: "general", label: "IA", icon: "🤖" },
    { id: "email", label: "Email", icon: "📧" },
    { id: "profile", label: "Perfil", icon: "🌍" },
    { id: "watering", label: "Rega", icon: "💧" },
  ];

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl h-[95vh] sm:h-[85vh] max-h-[800px] flex flex-col font-body overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 font-heading">
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-2 hover:bg-neutral-100 rounded-lg transition-all"
          >
            <span className="text-lg font-bold">✕</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-neutral-50 px-2 sm:px-4 pt-2 sm:pt-3 gap-1 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 min-w-[70px] sm:min-w-[80px] py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {activeTab === "general" && (
            <div className="space-y-6 max-w-xl animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Chave da API do Gemini (Google AI)
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={formData.geminiApiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, geminiApiKey: e.target.value })
                    }
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all pr-12 placeholder:text-neutral-400"
                    placeholder="AIzaSy..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showGeminiKey ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mt-4">
                  <p className="text-sm text-primary-800 leading-relaxed">
                    Personalize o motor de inteligência artificial. Deixe em
                    branco para usar a infraestrutura padrão do MyPlants.
                    <br />
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      className="inline-block mt-2 font-medium text-primary-600 hover:underline"
                      rel="noopener"
                    >
                      Gerar minha própria chave gratuita ↗
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              {/* Toggle notifications */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-900 font-medium block">
                      Notificações Ativas
                    </span>
                    <span className="text-xs text-neutral-500">
                      Receba avisos de rega diretamente no seu e-mail.
                    </span>
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
                    <div className="w-10 h-6 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>

              {/* SMTP fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Servidor SMTP (Host)
                  </label>
                  <input
                    type="text"
                    value={formData.smtp.host}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, host: e.target.value },
                      })
                    }
                    className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-neutral-400"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={formData.smtp.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: {
                          ...formData.smtp,
                          port: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    placeholder="587"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={formData.smtp.secure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtp: { ...formData.smtp, secure: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="secure"
                      className="ml-2 text-sm text-neutral-700"
                    >
                      Usar SSL/TLS
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email do Remetente
                  </label>
                  <input
                    type="email"
                    value={formData.smtp.fromEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, fromEmail: e.target.value },
                      })
                    }
                    className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-neutral-400"
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Usuário SMTP
                  </label>
                  <input
                    type="text"
                    value={formData.smtp.user}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, user: e.target.value },
                      })
                    }
                    className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Senha SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? "text" : "password"}
                      value={formData.smtp.pass}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtp: { ...formData.smtp, pass: e.target.value },
                        })
                      }
                      className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      title={showSmtpPass ? "Ocultar senha" : "Exibir senha"}
                    >
                      {showSmtpPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-sm text-yellow-800">
                  ⚠️ Para Gmail, é necessário usar uma{" "}
                  <span className="font-semibold">Senha de App</span>.
                </p>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-yellow-700 hover:underline text-sm font-medium"
                >
                  Gerar Senha de App aqui ↗
                </a>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail || loading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
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
                <span className="text-neutral-700 font-medium">
                  Ativar Perfil Público
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {formData.isPublic && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-neutral-400"
                      placeholder="Ex: Jardim do Gustavo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Link do Perfil (Slug)
                    </label>
                    <div className="flex items-center">
                      <span className="bg-neutral-100 border border-r-0 border-neutral-200 rounded-l-lg px-3 py-2.5 text-neutral-500 text-sm">
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
                        className="w-full border border-neutral-200 rounded-r-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                        placeholder="meu-jardim"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1.5">
                      Apenas letras minúsculas, números e hífens.
                    </p>
                  </div>

                  {formData.slug && (
                    <div className="pt-2">
                      <a
                        href={`/${formData.slug}`}
                        target="_blank"
                        className="text-primary-600 hover:underline text-sm flex items-center gap-1"
                        rel="noopener"
                      >
                        🔗 Visualizar meu perfil público
                      </a>
                    </div>
                  )}
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 border-t border-neutral-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-neutral-600 hover:text-neutral-800 transition-all text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 text-sm font-medium shadow-sm"
          >
            {loading ? "Processando..." : "Salvar"}
          </button>
        </div>

        {/* Confirmation Modal */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
                Confirmar Ação
              </h3>
              <p className="text-neutral-600 text-sm mb-4 sm:mb-6">
                {confirmDialog.message}
              </p>
              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: false,
                      message: "",
                      onConfirm: null,
                    })
                  }
                  className="px-3 sm:px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        {alertDialog.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3
                className={`text-base sm:text-lg font-semibold mb-2 ${alertDialog.isError ? "text-red-600" : "text-neutral-900"}`}
              >
                {alertDialog.isError ? "Erro" : "Sucesso"}
              </h3>
              <p className="text-neutral-600 text-sm mb-4 sm:mb-6">
                {alertDialog.message}
              </p>
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
                  className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${alertDialog.isError ? "bg-red-500 hover:bg-red-600" : "bg-primary-500 hover:bg-primary-600"}`}
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
