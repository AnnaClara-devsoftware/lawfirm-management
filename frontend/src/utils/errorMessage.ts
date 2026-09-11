import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types";

/**
 * Converte qualquer erro (de rede, Axios, ou desconhecido) em uma mensagem
 * amigável para exibir ao usuário. Nunca repassa stack traces ou detalhes
 * internos do backend — só a mensagem que o GlobalExceptionHandler já
 * preparou para consumo externo.
 */
export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado. Tente novamente."): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão.";
    }
    const data = error.response.data;
    if (data?.fieldErrors && data.fieldErrors.length > 0) {
      return data.fieldErrors.map((fe) => fe.message).join(" ");
    }
    if (data?.message) {
      return data.message;
    }
    if (error.response.status === 401) {
      return "Sua sessão expirou. Faça login novamente.";
    }
    if (error.response.status === 403) {
      return "Você não tem permissão para executar esta ação.";
    }
  }
  return fallback;
}

/** Extrai os erros de campo (para exibir abaixo de cada input do formulário). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError<ApiErrorResponse>(error) && error.response?.data.fieldErrors) {
    const map: Record<string, string> = {};
    for (const fe of error.response.data.fieldErrors) {
      map[fe.field] = fe.message;
    }
    return map;
  }
  return {};
}
