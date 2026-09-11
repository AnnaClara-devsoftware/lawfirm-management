import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, CalendarClock, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { deadlinesService } from "@/services/deadlines";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DeadlineFormModal } from "@/pages/Deadlines/DeadlineFormModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { CAN_MANAGE_CASES, DEADLINE_PRIORITY_LABELS, DEADLINE_STATUS_LABELS, DEADLINE_STATUS_TONE, PAGE_SIZE, PRIORITY_TONE } from "@/constants";
import { formatDate } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";
import type { DeadlineResponse, DeadlineStatus } from "@/types";

export function DeadlinesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const canManage = !!user && CAN_MANAGE_CASES.includes(user.role);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<DeadlineStatus | "">("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<DeadlineResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<DeadlineResponse | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["deadlines", { page, statusFilter, overdueOnly }],
    queryFn: () => deadlinesService.list({ page, size: PAGE_SIZE, status: statusFilter, overdue: overdueOnly }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => deadlinesService.complete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      showToast("Prazo concluído.", "success");
    },
    onError: (err) => showToast(getErrorMessage(err), "error"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => deadlinesService.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      showToast("Prazo cancelado.", "success");
      setCancelTarget(null);
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setCancelTarget(null);
    },
  });

  const openCreate = () => {
    setEditingDeadline(null);
    setFormOpen(true);
  };

  const openEdit = (item: DeadlineResponse) => {
    setEditingDeadline(item);
    setFormOpen(true);
  };

  return (
    <div className="page">
      <div className="page__toolbar">
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as DeadlineStatus | "");
            setPage(0);
          }}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          {Object.entries(DEADLINE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => {
              setOverdueOnly(e.target.checked);
              setPage(0);
            }}
          />
          Somente vencidos
        </label>
        {canManage && (
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Novo prazo
          </Button>
        )}
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <TableContainer>
            <thead>
              <tr>
                <th>Título</th>
                <th>Processo</th>
                <th>Vencimento</th>
                <th>Prioridade</th>
                <th>Status</th>
                {canManage && <th aria-label="Ações" />}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}
              {!isLoading &&
                data?.content.map((item) => (
                  <tr key={item.id} className={item.overdue ? "row--danger" : ""}>
                    <td data-label="Título">{item.title}</td>
                    <td data-label="Processo">{item.legalCaseTitle}</td>
                    <td data-label="Vencimento">
                      {formatDate(item.dueDate)}
                      {item.overdue && (
                        <Badge tone="danger" >
                          Vencido
                        </Badge>
                      )}
                    </td>
                    <td data-label="Prioridade">
                      <Badge tone={PRIORITY_TONE[item.priority]}>{DEADLINE_PRIORITY_LABELS[item.priority]}</Badge>
                    </td>
                    <td data-label="Status">
                      <Badge tone={DEADLINE_STATUS_TONE[item.status]}>{DEADLINE_STATUS_LABELS[item.status]}</Badge>
                    </td>
                    {canManage && (
                      <td data-label="Ações" className="table-actions">
                        {item.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Editar"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Concluir"
                              onClick={() => completeMutation.mutate(item.id)}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Cancelar"
                              onClick={() => setCancelTarget(item)}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState icon={<CalendarClock size={40} />} title="Nenhum prazo encontrado" description="Ajuste os filtros ou cadastre um novo prazo." />
          )}

          {data && (
            <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          )}
        </>
      )}

      <DeadlineFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} deadline={editingDeadline} />

      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Cancelar prazo"
        message={`Tem certeza que deseja cancelar o prazo "${cancelTarget?.title}"?`}
        confirmLabel="Cancelar prazo"
        isLoading={cancelMutation.isPending}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
