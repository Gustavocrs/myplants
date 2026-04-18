"use client";

import { useEffect, useState } from "react";
import {
  FiCpu,
  FiDroplet,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiGrid,
  FiMail,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import WateringStatus from "../WateringStatus";

export default function SettingsView({ onClose, plants = [], onUpdatePlants }) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [hostName, setHostName] = useState("");

  const [formData, setFormData] = useState({
    slug: "",
    isPublic: false,
    displayName: "",
    emailNotificationsEnabled: true,
    geminiApiKey: "",
    gridMode: "2",
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
    if (user) loadSettings();
    setHostName(globalThis.location?.host || "myplants.link");
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
          gridMode: data.gridMode || "2",
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
      showSuccess("Configurações salvas!");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      await api.saveSettings(user.uid, formData);
      await api.testNotification(user.uid, user.email);
      showSuccess(`E-mail de teste enviado para ${user.email}`);
    } catch (error) {
      console.error("Erro ao testar email:", error);
      showError(error);
    } finally {
      setTestingEmail(false);
    }
  };

  const tabs = [
    { id: "general", label: "Inteligência IA", icon: <FiCpu /> },
    { id: "layout", label: "Layout", icon: <FiGrid /> },
    { id: "email", label: "Notificações", icon: <FiMail /> },
    { id: "profile", label: "Perfil Público", icon: <FiGlobe /> },
    { id: "watering", label: "Gestão Global", icon: <FiDroplet /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-900 animate-fade-in overflow-hidden">
      <div className="w-full h-full bg-white dark:bg-neutral-900 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-72 bg-neutral-50 dark:bg-neutral-900/20 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800/50 flex flex-col p-4 md:p-6 shrink-0 z-10">
          <div className="mb-4 md:mb-10 flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiSettings size={18} className="md:w-[22px]" />
              </div>
              <h2 className="text-lg md:text-xl font-black font-heading tracking-tight dark:text-white">
                Ajustes
              </h2>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
            >
              <FiX size={24} />
            </button>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 flex-1 scroll-smooth justify-around md:justify-start items-center md:items-start">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-none md:flex-none flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-neutral-800 text-primary-600 shadow-md scale-105"
                    : "text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <span className="text-xl md:text-lg">{tab.icon}</span>
                <span className="hidden md:inline tracking-tight">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={onClose}
            className="hidden md:flex mt-4 items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-all"
          >
            <FiX size={20} />
            <span className="tracking-tight">Voltar</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 relative h-full">
          <header className="px-6 py-4 md:px-10 md:py-8 flex items-center justify-between border-b border-neutral-50 dark:border-neutral-800/40 shrink-0">
            <div>
              <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight dark:text-white capitalize">
                {tabs.find(t => t.id === activeTab)?.label || activeTab}
              </h3>
              <p className="text-[10px] md:text-xs text-neutral-400 font-medium mt-0.5 md:mt-1">
                Gerencie as preferências do seu sistema botânico.
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth pb-32">
            {activeTab === "general" && (
              <div className="animate-fade-in space-y-8 max-w-2xl">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                    Google Gemini API KEY
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={formData.geminiApiKey}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          geminiApiKey: e.target.value,
                        })
                      }
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 placeholder:text-neutral-300 transition-all pr-12"
                      placeholder="AIzaSy..."
                    />
                    <button
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    >
                      {showGeminiKey ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800/40">
                    <p className="text-sm text-primary-800 dark:text-primary-300 leading-relaxed font-medium">
                      Este é o motor de visão computacional da planta. Se
                      preferir, você pode usar sua própria chave para maior
                      performance e limites customizados.
                    </p>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-black text-primary-600 dark:text-primary-400 hover:underline"
                      rel="noopener"
                    >
                      Obter chave gratuita <FiExternalLink />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="animate-fade-in space-y-6 max-w-2xl">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-4">
                    Layout do Jardim
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, gridMode: "1" })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                        formData.gridMode === "1"
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-200 dark:bg-neutral-700 dark:text-white"
                      }`}
                    >
                      <FiLayers size={16} />
                      <span>1</span>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, gridMode: "2" })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                        formData.gridMode === "2"
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-200 dark:bg-neutral-700 dark:text-white"
                      }`}
                    >
                      <FiGrid size={16} />
                      <span>2</span>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, gridMode: "list" })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                        formData.gridMode === "list"
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-200 dark:bg-neutral-700 dark:text-white"
                      }`}
                    >
                      <FiList size={16} />
                      <span>Lista</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="max-w-2xl animate-fade-in space-y-8">
                <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800/40 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">
                      Lembretes por E-mail
                    </h4>
                    <p className="text-xs text-neutral-500 font-medium">
                      Receba alertas de rega automáticos.
                    </p>
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
                    <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer-checked:bg-primary-500 transition-all"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                      Servidor SMTP
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
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
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
                      className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-bold"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.smtp.secure}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            smtp: {
                              ...formData.smtp,
                              secure: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 rounded-lg text-primary-600"
                      />
                      <span className="text-xs font-bold text-neutral-400 uppercase lg:tracking-widest">
                        SSL Seguro
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="w-full sm:w-auto py-4 px-8 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-all"
                >
                  {testingEmail ? "Enviando..." : "📧 Testar Conexão de E-mail"}
                </button>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="max-w-xl animate-fade-in space-y-8">
                <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/40">
                  <h4 className="text-blue-800 dark:text-blue-300 font-bold mb-2">
                    Seu Jardim para o Mundo
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                    Ao ativar o perfil público, você gera um link único para
                    compartilhar sua coleção e progresso de cultivo.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      Exibir Perfil Público
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublic: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer-checked:bg-primary-500 transition-all"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
                    </label>
                  </div>

                  {formData.isPublic && (
                    <div className="space-y-6 pt-4 animate-slide-up">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                          Identidade do Jardim (URL)
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-neutral-300 font-mono text-sm break-all">
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
                            className="flex-1 bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm font-black text-primary-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "watering" && (
              <div className="animate-fade-in max-w-4xl">
                <WateringStatus
                  plants={plants}
                  onUpdateWatering={async (id, data) => {
                    setLoading(true);
                    await api.updatePlant(id, {
                      ultimaRega: data,
                      notificationSent: false,
                    });
                    onUpdatePlants && onUpdatePlants();
                    setLoading(false);
                  }}
                />
              </div>
            )}
          </div>

          <footer className="absolute bottom-0 left-0 right-0 p-6 md:p-10 border-t border-neutral-50 dark:border-neutral-800/40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex justify-end gap-3 md:gap-4 z-20">
            <button
              onClick={onClose}
              className="px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm font-bold text-neutral-400 uppercase tracking-widest hover:text-neutral-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 md:px-12 py-3 md:py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex-1 sm:flex-none"
            >
              {loading ? "Gravando..." : "Salvar"}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
