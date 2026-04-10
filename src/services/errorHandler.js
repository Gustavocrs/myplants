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
  const status = error.response?.status;

  // Erros de API (status 403, 429)
  if (
    status === 403 ||
    message.includes("API key") ||
    message.includes("API_KEY")
  ) {
    return {
      type: ErrorTypes.API_KEY_EXPIRED,
      message: ErrorMessages.api_key_expired,
    };
  }

  if (
    status === 429 ||
    message.includes("quota") ||
    message.includes("rate limit")
  ) {
    return {
      type: ErrorTypes.API_QUOTA_EXCEEDED,
      message: ErrorMessages.api_quota_exceeded,
    };
  }

  // Erros de rede
  if (
    status === 0 ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("Failed to fetch")
  ) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      message: ErrorMessages.network_error,
    };
  }

  // Erros de autenticação
  if (
    status === 401 ||
    message.includes("auth") ||
    message.includes("unauthorized")
  ) {
    return { type: ErrorTypes.AUTH_ERROR, message: ErrorMessages.auth_error };
  }

  // Não encontrado
  if (
    status === 404 ||
    message.includes("not found") ||
    message.includes("não encontrado")
  ) {
    return { type: ErrorTypes.NOT_FOUND, message: ErrorMessages.not_found };
  }

  // Erro de validação
  if (status === 400 || message.includes("validation")) {
    return {
      type: ErrorTypes.VALIDATION_ERROR,
      message: ErrorMessages.validation_error,
    };
  }

  // Erro de servidor
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
