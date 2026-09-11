import { http } from "@/services/api";
import type { CreateDeadlineRequest, DeadlineResponse, DeadlineStatus, Page, UpdateDeadlineRequest } from "@/types";

export interface DeadlineListParams {
  page: number;
  size: number;
  legalCaseId?: string;
  status?: DeadlineStatus | "";
  overdue?: boolean;
}

export const deadlinesService = {
  list: ({ page, size, legalCaseId, status, overdue }: DeadlineListParams) =>
    http
      .get<Page<DeadlineResponse>>("/deadlines", {
        params: { page, size, legalCaseId: legalCaseId || undefined, status: status || undefined, overdue: overdue || undefined },
      })
      .then((r) => r.data),

  findById: (id: string) => http.get<DeadlineResponse>(`/deadlines/${id}`).then((r) => r.data),

  create: (payload: CreateDeadlineRequest) =>
    http.post<DeadlineResponse>("/deadlines", payload).then((r) => r.data),

  update: (id: string, payload: UpdateDeadlineRequest) =>
    http.put<DeadlineResponse>(`/deadlines/${id}`, payload).then((r) => r.data),

  complete: (id: string) => http.patch<DeadlineResponse>(`/deadlines/${id}/complete`).then((r) => r.data),

  cancel: (id: string) => http.patch<DeadlineResponse>(`/deadlines/${id}/cancel`).then((r) => r.data),
};
