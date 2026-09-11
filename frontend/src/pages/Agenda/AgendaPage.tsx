import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, CalendarDays, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { appointmentsService } from "@/services/appointments";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { AppointmentFormModal } from "@/pages/Agenda/AppointmentFormModal";
import { useToast } from "@/hooks/useToast";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONE, APPOINTMENT_TYPE_LABELS, PAGE_SIZE } from "@/constants";
import { formatDateTime } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";
import type { AppointmentResponse, AppointmentStatus } from "@/types";

export function AgendaPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["appointments", { page, statusFilter }],
    queryFn: () => appointmentsService.list({ page, size: PAGE_SIZE, status: statusFilter }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.complete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showToast("Compromisso concluído.", "success");
    },
    onError: (err) => showToast(getErrorMessage(err), "error"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showToast("Compromisso cancelado.", "success");
    },
    onError: (err) => showToast(getErrorMessage(err), "error"),
  });

  const openCreate = () => {
    setEditingAppointment(null);
    setFormOpen(true);
  };

  const openEdit = (item: AppointmentResponse) => {
    setEditingAppointment(item);
    setFormOpen(true);
  };

  return (
    <div className="page">
      <div className="page__toolbar">
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as AppointmentStatus | "");
            setPage(0);
          }}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          Novo compromisso
        </Button>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <TableContainer>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Início</th>
                <th>Local</th>
                <th>Responsável</th>
                <th>Status</th>
                <th aria-label="Ações" />
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
                  <tr key={item.id}>
                    <td data-label="Título">{item.title}</td>
                    <td data-label="Tipo">{APPOINTMENT_TYPE_LABELS[item.type]}</td>
                    <td data-label="Início">{formatDateTime(item.startsAt)}</td>
                    <td data-label="Local">{item.location || "—"}</td>
                    <td data-label="Responsável">{item.assignedUserName || "—"}</td>
                    <td data-label="Status">
                      <Badge tone={APPOINTMENT_STATUS_TONE[item.status]}>{APPOINTMENT_STATUS_LABELS[item.status]}</Badge>
                    </td>
                    <td data-label="Ações" className="table-actions">
                      {item.status === "SCHEDULED" && (
                        <>
                          <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(item)}>
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
                            onClick={() => cancelMutation.mutate(item.id)}
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState icon={<CalendarDays size={40} />} title="Nenhum compromisso encontrado" description="Cadastre um novo compromisso na agenda." />
          )}

          {data && (
            <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          )}
        </>
      )}

      <AppointmentFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} appointment={editingAppointment} />
    </div>
  );
}
