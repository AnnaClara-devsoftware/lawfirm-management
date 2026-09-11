import { http } from "@/services/api";
import type {
  CreateLegalCaseRequest,
  LegalCaseResponse,
  LegalCaseStatus,
  Page,
  UpdateLegalCaseRequest,
} from "@/types";

export interface LegalCaseListParams {
  page: number;
  size: number;
  search?: string;
  status?: LegalCaseStatus | "";
}

export const casesService = {
  list: ({ page, size, search, status }: LegalCaseListParams) =>
    http
      .get<Page<LegalCaseResponse>>("/legal-cases", {
        params: { page, size, search: search || undefined, status: status || undefined },
      })
      .then((r) => r.data),

  findById: (id: string) => http.get<LegalCaseResponse>(`/legal-cases/${id}`).then((r) => r.data),

  create: (payload: CreateLegalCaseRequest) =>
    http.post<LegalCaseResponse>("/legal-cases", payload).then((r) => r.data),

  update: (id: string, payload: UpdateLegalCaseRequest) =>
    http.put<LegalCaseResponse>(`/legal-cases/${id}`, payload).then((r) => r.data),
};
