import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { usersService } from "@/services/users";
import { setSessionExpiredHandler } from "@/services/api";
import { tokenStorage } from "@/utils/tokenStorage";
import type { LoginRequest, RegisterRequest, UserResponse } from "@/types";

interface AuthContextValue {
  user: UserResponse | null;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const navigate = useNavigate();

  const forceLogout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setSessionExpiredHandler(forceLogout);
  }, [forceLogout]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.getAccessToken()) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const me = await usersService.me();
        setUser(me);
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authService.login(payload);
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const response = await authService.register(payload);
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Mesmo se a chamada falhar (ex: token já expirado), limpamos localmente.
    } finally {
      tokenStorage.clear();
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const refreshCurrentUser = useCallback(async () => {
    const me = await usersService.me();
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, isBootstrapping, login, register, logout, refreshCurrentUser }),
    [user, isBootstrapping, login, register, logout, refreshCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
