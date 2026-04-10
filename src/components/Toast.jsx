"use client";
import { createContext, useCallback, useContext, useState } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";
import {
  ErrorTypes,
  getActionForError,
  parseError,
} from "@/services/errorHandler";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "error", duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showError = useCallback(
    (error) => {
      const parsed = parseError(error);
      addToast(parsed.message, "error");
      return parsed;
    },
    [addToast],
  );

  const showSuccess = useCallback(
    (message) => {
      addToast(message, "success");
    },
    [addToast],
  );

  const showInfo = useCallback(
    (message) => {
      addToast(message, "info");
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, removeToast, showError, showSuccess, showInfo }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const icons = {
    error: <FiAlertCircle className="text-red-500" size={20} />,
    success: <FiCheckCircle className="text-green-500" size={20} />,
    info: <FiInfo className="text-blue-500" size={20} />,
    warning: <FiAlertTriangle className="text-yellow-500" size={20} />,
  };

  const bgColors = {
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-slide-up max-w-sm ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-neutral-400 hover:text-neutral-600"
      >
        <FiX size={18} />
      </button>
    </div>
  );
}
