import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Check } from "lucide-react";
import { notificationsService } from "@/services/notifications";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { NOTIFICATION_TYPE_LABELS, PAGE_SIZE } from "@/constants";
import { formatDateTime } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";

export function NotificationsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications", { page, unreadOnly }],
    queryFn: () => notificationsService.list(page, PAGE_SIZE, unreadOnly),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => showToast(getErrorMessage(err), "error"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast("Todas as notificações foram marcadas como lidas.", "success");
    },
    onError: (err) => showToast(getErrorMessage(err), "error"),
  });

  return (
    <div className="page">
      <div className="page__toolbar">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(0);
            }}
          />
          Somente não lidas
        </label>
        <Button variant="secondary" icon={<CheckCheck size={16} />} isLoading={markAllReadMutation.isPending} onClick={() => markAllReadMutation.mutate()}>
          Marcar todas como lidas
        </Button>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Spinner />
      ) : data && data.content.length > 0 ? (
        <>
          <div className="notification-list">
            {data.content.map((notification) => (
              <Card key={notification.id} className={`notification-item ${!notification.read ? "notification-item--unread" : ""}`}>
                <div className="notification-item__header">
                  <Badge tone={notification.read ? "neutral" : "warning"}>{NOTIFICATION_TYPE_LABELS[notification.type]}</Badge>
                  <span className="notification-item__date">{formatDateTime(notification.createdAt)}</span>
                </div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                {!notification.read && (
                  <Button variant="ghost" icon={<Check size={14} />} onClick={() => markReadMutation.mutate(notification.id)}>
                    Marcar como lida
                  </Button>
                )}
              </Card>
            ))}
          </div>
          <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon={<Bell size={40} />} title="Nenhuma notificação" description="Você está em dia — nenhuma notificação por aqui." />
      )}
    </div>
  );
}
