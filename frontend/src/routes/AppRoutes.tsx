import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "@/pages/Login/RegisterPage";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { ClientsPage } from "@/pages/Clients/ClientsPage";
import { CasesPage } from "@/pages/Cases/CasesPage";
import { DeadlinesPage } from "@/pages/Deadlines/DeadlinesPage";
import { AgendaPage } from "@/pages/Agenda/AgendaPage";
import { DocumentsPage } from "@/pages/Documents/DocumentsPage";
import { NotificationsPage } from "@/pages/Notifications/NotificationsPage";
import { UsersPage } from "@/pages/Users/UsersPage";
import { UserDetailPage } from "@/pages/Users/UserDetailPage";
import { AuditLogsPage } from "@/pages/AuditLogs/AuditLogsPage";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/deadlines" element={<DeadlinesPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />

          <Route element={<RoleRoute allowed={["ADMIN"]} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
