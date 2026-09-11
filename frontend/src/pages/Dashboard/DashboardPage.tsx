import { useQuery } from "@tanstack/react-query";
import {
  Users2,
  Briefcase,
  CalendarClock,
  AlertTriangle,
  CalendarDays,
  Bell,
  UserCog,
  CheckCircle2,
} from "lucide-react";
import { dashboardService } from "@/services/dashboard";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { getErrorMessage } from "@/utils/errorMessage";

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.summary(),
  });

  if (isLoading) {
    return (
      <div className="full-page-center">
        <Spinner label="Carregando indicadores..." />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error, "Não foi possível carregar o dashboard.")} onRetry={() => void refetch()} />;
  }

  const metrics = [
    { label: "Clientes ativos", value: data.activeClients, total: data.totalClients, icon: Users2 },
    { label: "Processos ativos", value: data.activeCases, total: data.totalCases, icon: Briefcase },
    { label: "Prazos pendentes", value: data.pendingDeadlines, icon: CalendarClock, tone: "warning" as const },
    { label: "Prazos vencidos", value: data.overdueDeadlines, icon: AlertTriangle, tone: "danger" as const },
    { label: "Compromissos próximos", value: data.upcomingAppointments, icon: CalendarDays },
    { label: "Notificações não lidas", value: data.unreadNotifications, icon: Bell },
    { label: "Usuários ativos", value: data.activeUsers, total: data.totalUsers, icon: UserCog },
    { label: "Processos encerrados", value: data.totalCases - data.activeCases, icon: CheckCircle2 },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        {metrics.map((metric) => (
          <Card key={metric.label} className={`metric-card ${metric.tone ? `metric-card--${metric.tone}` : ""}`}>
            <div className="metric-card__icon">
              <metric.icon size={22} />
            </div>
            <div>
              <span className="metric-card__value">
                {metric.value}
                {metric.total !== undefined && <small> / {metric.total}</small>}
              </span>
              <span className="metric-card__label">{metric.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
