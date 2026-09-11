import { http } from "@/services/api";
import type { DashboardResponse } from "@/types";

export const dashboardService = {
  summary: () => http.get<DashboardResponse>("/dashboard").then((r) => r.data),
};
