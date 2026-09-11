import { http } from "@/services/api";
import type { NotificationResponse, Page } from "@/types";

export const notificationsService = {
  list: (page: number, size: number, unread = false) =>
    http
      .get<Page<NotificationResponse>>("/notifications", { params: { page, size, unread } })
      .then((r) => r.data),

  unreadCount: () => http.get<number>("/notifications/unread/count").then((r) => r.data),

  markRead: (id: string) => http.patch<NotificationResponse>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => http.patch<void>("/notifications/read-all").then((r) => r.data),
};
