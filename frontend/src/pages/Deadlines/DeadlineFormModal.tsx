import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { deadlinesService } from "@/services/deadlines";
import { casesService } from "@/services/cases";
import { getErrorMessage, getFieldErrors } from "@/utils/errorMessage";
import { DEADLINE_PRIORITY_LABELS, DEADLINE_STATUS_LABELS } from "@/constants";
import type { DeadlinePriority, DeadlineResponse, DeadlineStatus } from "@/types";

interface DeadlineFormState {
  title: string;
  description: string;
  dueDate: string;
  priority: DeadlinePriority;
  status: DeadlineStatus;
  legalCaseId: string;
}

const EMPTY_FORM: DeadlineFormState = {
  title: "",
  description: "",
  dueDate: new Date().toISOString().slice(0, 10),
  priority: "NORMAL",
  status: "PENDING",
  legalCaseId: "",
};

interface DeadlineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadline: DeadlineResponse | null;
}

export function DeadlineFormModal({ isOpen, onClose, deadline }: DeadlineFormModalProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!deadline;

  const [form, setForm] = useState<DeadlineFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: casesPage } = useQuery({
    queryKey: ["cases", "dropdown"],
    queryFn: () => casesService.list({ page: 0, size: 100 }),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setFormError(null);
    if (deadline) {
      setForm({
        title: deadline.title,
        description: deadline.description ?? "",
        dueDate: deadline.dueDate,
        priority: deadline.priority,
        status: deadline.status,
        legalCaseId: deadline.legalCaseId,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [deadline, isOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      if (isEditing) {
        return deadlinesService.update(deadline!.id, {
          title: form.title.trim(),
          description: form.description || null,
          dueDate: form.dueDate,
          status: form.status,
          priority: form.priority,
          legalCaseId: form.legalCaseId,
        });
      }
      return deadlinesService.create({
        title: form.title.trim(),
        description: form.description || null,
        dueDate: form.dueDate,
        priority: form.priority,
        legalCaseId: form.legalCaseId,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      showToast(isEditing ? "Prazo atualizado com sucesso." : "Prazo cadastrado com sucesso.", "success");
      onClose();
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    },
  });

  return (
    <Modal title={isEditing ? "Editar prazo" : "Novo prazo"} isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        noValidate
      >
        <div className="form-grid">
          <Select
            label="Processo"
            required
            value={form.legalCaseId}
            onChange={(e) => setForm({ ...form, legalCaseId: e.target.value })}
            error={fieldErrors.legalCaseId}
          >
            <option value="">Selecione...</option>
            {casesPage?.content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.cnjNumber})
              </option>
            ))}
          </Select>
          <Input
            label="Título"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={fieldErrors.title}
          />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={fieldErrors.description}
          />
          <Input
            label="Data limite"
            type="date"
            required
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            error={fieldErrors.dueDate}
          />
          <Select
            label="Prioridade"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as DeadlinePriority })}
            error={fieldErrors.priority}
          >
            {Object.entries(DEADLINE_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {isEditing && (
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as DeadlineStatus })}
              error={fieldErrors.status}
            >
              {Object.entries(DEADLINE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </div>

        {formError && <p className="auth-card__error">{formError}</p>}

        <div className="modal__actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? "Salvar alterações" : "Cadastrar prazo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
