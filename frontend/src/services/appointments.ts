import { http } from "@/services/api";
import type { AppointmentResponse, AppointmentStatus, CreateAppointmentRequest, Page, UpdateAppointmentRequest } from "@/types";

export interface AppointmentListParams {
  page: number;
  size: number;
  status?: AppointmentStatus | "";
}

export const appointmentsService = {
  list: ({ page, size, status }: AppointmentListParams) =>
    http
      .get<Page<AppointmentResponse>>("/appointments", { params: { page, size, status: status || undefined } })
      .then((r) => r.data),

  findById: (id: string) => http.get<AppointmentResponse>(`/appointments/${id}`).then((r) => r.data),

  create: (payload: CreateAppointmentRequest) =>
    http.post<AppointmentResponse>("/appointments", payload).then((r) => r.data),

  update: (id: string, payload: UpdateAppointmentRequest) =>
    http.put<AppointmentResponse>(`/appointments/${id}`, payload).then((r) => r.data),

  complete: (id: string) => http.patch<AppointmentResponse>(`/appointments/${id}/complete`).then((r) => r.data),

  cancel: (id: string) => http.patch<AppointmentResponse>(`/appointments/${id}/cancel`).then((r) => r.data),
};
