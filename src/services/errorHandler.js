export const ErrorTypes = {
  NETWORK_ERROR: "network_error",
  AUTH_ERROR: "auth_error",
  API_KEY_EXPIRED: "api_key_expired",
  API_QUOTA_EXCEEDED: "api_quota_exceeded",
  VALIDATION_ERROR: "validation_error",
  NOT_FOUND: "not_found",
  SERVER_ERROR: "server_error",
  UNKNOWN: "unknown",
};

export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]:
    "Ops! Problema de conexão. Verifique sua internet.",
  [ErrorTypes.AUTH_ERROR]: "Sua sessão expirou. Faça login novamente.",
  [ErrorTypes.API_KEY_EXPIRED]:
    "A chave de acesso à IA expirou. Renove nas Configurações.",
  [ErrorTypes.API_QUOTA_EXCEEDED]:
    "Limite de uso da IA atingido. Tente novamente mais tarde.",
  [ErrorTypes.VALIDATION_ERROR]: "Ops! Dados inválidos. Verifique os campos.",
  [ErrorTypes.NOT_FOUND]: "Ops! Item não encontrado.",
  [ErrorTypes.SERVER_ERROR]: "Ops! Algo deu errado. Tente novamente.",
  [ErrorTypes.UNKNOWN]: "Ops! Ocorreu um erro inesperado.",
};

export function parseError(error) {
  if (!error)
    return { type: ErrorTypes.UNKNOWN, message: ErrorMessages.unknown };

  const message = error.message || "";
  const status = error.status || error.response?.status;
  const data = error.responseData || error.response?.data;
  const code = error.code || data?.error;
  const msgLower = message.toLowerCase();

  if (
    status === 403 ||
    code === "api_key_expired" ||
    msgLower.includes("api key expired") ||
    msgLower.includes("api_key_invalid") ||
    msgLower.includes("api key")
  ) {
    return {
      type: ErrorTypes.API_KEY_EXPIRED,
      message: ErrorMessages.api_key_expired,
    };
  }

  if (
    status === 429 ||
    code === "api_quota_exceeded" ||
    msgLower.includes("quota") ||
    msgLower.includes("rate limit") ||
    msgLower.includes("resource_exhausted") ||
    msgLower.includes("429")
  ) {
    const retryAfter = error.retryAfter || data?.retryAfter;
    const msg = retryAfter
      ? `Limite de uso da IA atingido. Tente novamente em ~${retryAfter}s.`
      : data?.message || ErrorMessages.api_quota_exceeded;
    return {
      type: ErrorTypes.API_QUOTA_EXCEEDED,
      message: msg,
      retryAfter,
    };
  }

  if (
    status === 0 ||
    msgLower.includes("network") ||
    msgLower.includes("fetch") ||
    msgLower.includes("failed to fetch")
  ) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      message: ErrorMessages.network_error,
    };
  }

  if (
    status === 401 ||
    msgLower.includes("auth") ||
    msgLower.includes("unauthorized")
  ) {
    return { type: ErrorTypes.AUTH_ERROR, message: ErrorMessages.auth_error };
  }

  if (
    status === 404 ||
    msgLower.includes("not found") ||
    msgLower.includes("não encontrado")
  ) {
    return { type: ErrorTypes.NOT_FOUND, message: ErrorMessages.not_found };
  }

  if (status === 400 || msgLower.includes("validation")) {
    return {
      type: ErrorTypes.VALIDATION_ERROR,
      message: ErrorMessages.validation_error,
    };
  }

  if (status >= 500) {
    return {
      type: ErrorTypes.SERVER_ERROR,
      message: ErrorMessages.server_error,
    };
  }

  return { type: ErrorTypes.UNKNOWN, message: ErrorMessages.unknown };
}

export function getActionForError(type) {
  switch (type) {
    case ErrorTypes.API_KEY_EXPIRED:
      return { label: "Ir para Configurações", path: "/?settings=true" };
    case ErrorTypes.NETWORK_ERROR:
      return { label: "Tentar novamente", action: "retry" };
    case ErrorTypes.NOT_FOUND:
      return { label: "Voltar ao Jardim", path: "/" };
    default:
      return null;
  }
}
