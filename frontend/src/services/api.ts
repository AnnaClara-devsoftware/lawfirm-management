import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/utils/tokenStorage";
import type { AuthResponse } from "@/types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const http = axios.create({
  baseURL: `${baseURL}/api`,
    timeout: 65000,
});

// Instância separada, sem interceptors, usada só para chamar /auth/refresh
// de forma isolada (evita loop infinito de interceptor chamando a si mesmo).
const refreshClient = axios.create({
  baseURL: `${baseURL}/api`,
    timeout: 65000,
});

let onSessionExpired: (() => void) | null = null;

/** Registrado pelo AuthContext para reagir quando a sessão não puder mais ser renovada. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// --- Fila de requisições que aguardam o término de um refresh em andamento ---
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (status !== 401 || isAuthEndpoint || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      onSessionExpired?.();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Já existe um refresh em andamento: entra na fila e espera o resultado.
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
          resolve(http(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const expiredAccessToken = tokenStorage.getAccessToken();
      const response = await refreshClient.post<AuthResponse>(
        "/auth/refresh",
        { refreshToken },
        { headers: { Authorization: `Bearer ${expiredAccessToken ?? ""}` } },
      );
      tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      resolveQueue(response.data.accessToken);
      originalRequest.headers.set("Authorization", `Bearer ${response.data.accessToken}`);
      return http(originalRequest);
    } catch (refreshError) {
      resolveQueue(null);
      tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
