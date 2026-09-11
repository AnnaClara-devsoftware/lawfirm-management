import { http } from "@/services/api";
import type { ClientResponse, CreateClientRequest, Page, UpdateClientRequest } from "@/types";

export interface ClientListParams {
  page: number;
  size: number;
  search?: string;
  active?: boolean;
}

export const clientsService = {
  list: ({ page, size, search, active }: ClientListParams) =>
    http
      .get<Page<ClientResponse>>("/clients", { params: { page, size, search: search || undefined, active } })
      .then((r) => r.data),

  findById: (id: string) => http.get<ClientResponse>(`/clients/${id}`).then((r) => r.data),

  create: (payload: CreateClientRequest) => http.post<ClientResponse>("/clients", payload).then((r) => r.data),

  update: (id: string, payload: UpdateClientRequest) =>
    http.put<ClientResponse>(`/clients/${id}`, payload).then((r) => r.data),

  deactivate: (id: string) => http.patch<void>(`/clients/${id}/deactivate`).then((r) => r.data),

  activate: (id: string) => http.patch<void>(`/clients/${id}/activate`).then((r) => r.data),
};
