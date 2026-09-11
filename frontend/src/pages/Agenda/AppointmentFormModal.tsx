import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { appointmentsService } from "@/services/appointments";
import { casesService } from "@/services/cases";
import { clientsService } from "@/services/clients";
import { usersService } from "@/services/users";
import { getErrorMessage, getFieldErrors } from "@/utils/errorMessage";
import { toDateTimeLocalInput } from "@/utils/formatters";
import { APPOINTMENT_TYPE_LABELS } from "@/constants";
import type { AppointmentResponse, AppointmentStatus, AppointmentType } from "@/types";

interface AppointmentFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  type: AppointmentType;
  status: AppointmentStatus;
  assignedUserId: string;
  legalCaseId: string;
  clientId: string;
}

const EMPTY_FORM: AppointmentFormState = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  location: "",
  type: "MEETING",
  status: "SCHEDULED",
  assignedUserId: "",
  legalCaseId: "",
  clientId: "",
};

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentResponse | null;
}

export function AppointmentFormModal({ isOpen, onClose, appointment }: AppointmentFormModalProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!appointment;

  const [form, setForm] = useState<AppointmentFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: casesPage } = useQuery({
    queryKey: ["cases", "dropdown"],
    queryFn: () => casesService.list({ page: 0, size: 100 }),
    enabled: isOpen,
  });
  const { data: clientsPage } = useQuery({
    queryKey: ["clients", "dropdown"],
    queryFn: () => clientsService.list({ page: 0, size: 100, active: true }),
    enabled: isOpen,
  });
  const { data: usersPage } = useQuery({
    queryKey: ["users", "assignee-dropdown"],
    queryFn: () => usersService.list(0, 100),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setFormError(null);
    if (appointment) {
      setForm({
        title: appointment.title,
        description: appointment.description ?? "",
        startsAt: toDateTimeLocalInput(appointment.startsAt),
        endsAt: toDateTimeLocalInput(appointment.endsAt),
        location: appointment.location ?? "",
        type: appointment.type,
        status: appointment.status,
        assignedUserId: appointment.assignedUserId ?? "",
        legalCaseId: appointment.legalCaseId ?? "",
        clientId: appointment.clientId ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [appointment, isOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      const base = {
        title: form.title.trim(),
        description: form.description || null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
        location: form.location || null,
        type: form.type,
        assignedUserId: form.assignedUserId || null,
        legalCaseId: form.legalCaseId || null,
        clientId: form.clientId || null,
      };
      return isEditing
        ? appointmentsService.update(appointment!.id, { ...base, status: form.status })
        : appointmentsService.create(base);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showToast(isEditing ? "Compromisso atualizado com sucesso." : "Compromisso cadastrado com sucesso.", "success");
      onClose();
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    },
  });

  return (
    <Modal title={isEditing ? "Editar compromisso" : "Novo compromisso"} isOpen={isOpen} onClose={onClose} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        noValidate
      >
        <div className="form-grid">
          <Input
            label="Título"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={fieldErrors.title}
          />
          <Select
            label="Tipo"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AppointmentType })}
            error={fieldErrors.type}
          >
            {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Início"
            type="datetime-local"
            required
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            error={fieldErrors.startsAt}
          />
          <Input
            label="Término"
            type="datetime-local"
            required
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            error={fieldErrors.endsAt}
          />
          <Input
            label="Local"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            error={fieldErrors.location}
          />
          <Select
            label="Responsável"
            value={form.assignedUserId}
            onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}
            error={fieldErrors.assignedUserId}
          >
            <option value="">Nenhum</option>
            {usersPage?.content.filter((u) => u.active).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Select
            label="Processo relacionado"
            value={form.legalCaseId}
            onChange={(e) => setForm({ ...form, legalCaseId: e.target.value })}
            error={fieldErrors.legalCaseId}
          >
            <option value="">Nenhum</option>
            {casesPage?.content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Select
            label="Cliente relacionado"
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            error={fieldErrors.clientId}
          >
            <option value="">Nenhum</option>
            {clientsPage?.content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={fieldErrors.description}
          />
        </div>

        {formError && <p className="auth-card__error">{formError}</p>}

        <div className="modal__actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? "Salvar alterações" : "Cadastrar compromisso"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
