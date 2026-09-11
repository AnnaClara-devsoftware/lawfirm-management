import { http } from "@/services/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  login: (payload: LoginRequest) => http.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterRequest) => http.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  logout: () => http.post<void>("/auth/logout").then((r) => r.data),
};
