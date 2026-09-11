/**
 * Armazenamento de tokens no localStorage.
 *
 * Trade-off consciente: o backend emite access/refresh token como JSON no
 * corpo da resposta (não como cookie httpOnly), então a única forma de
 * persistir a sessão sem alterar o contrato da API é guardar os tokens no
 * cliente. localStorage foi escolhido em vez de sessionStorage para que a
 * sessão sobreviva ao fechar a aba — documentado no README como um risco
 * conhecido de XSS (mitigado por não haver innerHTML dinâmico nem libs de
 * terceiros que executem HTML arbitrário na aplicação).
 */
const ACCESS_TOKEN_KEY = "lawfirm.accessToken";
const REFRESH_TOKEN_KEY = "lawfirm.refreshToken";

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
