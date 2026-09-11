import { http } from "@/services/api";
import type {
  ChangePasswordRequest,
  Page,
  UpdateProfileRequest,
  UpdateRoleRequest,
  UserResponse,
} from "@/types";

export const usersService = {
  list: (page: number, size: number) =>
    http.get<Page<UserResponse>>("/users", { params: { page, size } }).then((r) => r.data),

  me: () => http.get<UserResponse>("/users/me").then((r) => r.data),

  findById: (id: string) => http.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  updateProfile: (id: string, payload: UpdateProfileRequest) =>
    http.put<UserResponse>(`/users/${id}`, payload).then((r) => r.data),

  changePassword: (id: string, payload: ChangePasswordRequest) =>
    http.patch<void>(`/users/${id}/password`, payload).then((r) => r.data),

  updateRole: (id: string, payload: UpdateRoleRequest) =>
    http.patch<UserResponse>(`/users/${id}/role`, payload).then((r) => r.data),

  deactivate: (id: string) => http.patch<void>(`/users/${id}/deactivate`).then((r) => r.data),

  activate: (id: string) => http.patch<void>(`/users/${id}/activate`).then((r) => r.data),
};
