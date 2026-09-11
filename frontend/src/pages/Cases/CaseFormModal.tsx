import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { casesService } from "@/services/cases";
import { clientsService } from "@/services/clients";
import { usersService } from "@/services/users";
import { getErrorMessage, getFieldErrors } from "@/utils/errorMessage";
import { onlyDigits } from "@/utils/formatters";
import { CASE_PRIORITY_LABELS, LEGAL_CASE_STATUS_LABELS } from "@/constants";
import type { CasePriority, LegalCaseResponse, LegalCaseStatus } from "@/types";

interface CaseFormState {
  cnjNumber: string;
  title: string;
  subject: string;
  court: string;
  tribunal: string;
  priority: CasePriority;
  status: LegalCaseStatus;
  openingDate: string;
  closingDate: string;
  clientId: string;
  assignedLawyerId: string;
}

const EMPTY_FORM: CaseFormState = {
  cnjNumber: "",
  title: "",
  subject: "",
  court: "",
  tribunal: "",
  priority: "NORMAL",
  status: "ACTIVE",
  openingDate: new Date().toISOString().slice(0, 10),
  closingDate: "",
  clientId: "",
  assignedLawyerId: "",
};

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalCase: LegalCaseResponse | null;
}

export function CaseFormModal({ isOpen, onClose, legalCase }: CaseFormModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!legalCase;
  const isAdmin = user?.role === "ADMIN";

  const [form, setForm] = useState<CaseFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: clientsPage } = useQuery({
    queryKey: ["clients", "dropdown"],
    queryFn: () => clientsService.list({ page: 0, size: 100, active: true }),
    enabled: isOpen,
  });

  const { data: lawyersPage } = useQuery({
    queryKey: ["users", "lawyers-dropdown"],
    queryFn: () => usersService.list(0, 100),
    enabled: isAdmin && isOpen,
  });
  const lawyers = (lawyersPage?.content ?? []).filter((u) => u.role === "ADVOGADO" && u.active);

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setFormError(null);
    if (legalCase) {
      setForm({
        cnjNumber: legalCase.cnjNumber,
        title: legalCase.title,
        subject: legalCase.subject ?? "",
        court: legalCase.court ?? "",
        tribunal: legalCase.tribunal ?? "",
        priority: legalCase.priority,
        status: legalCase.status,
        openingDate: legalCase.openingDate,
        closingDate: legalCase.closingDate ?? "",
        clientId: legalCase.clientId,
        assignedLawyerId: legalCase.assignedLawyerId ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [legalCase, isOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      const base = {
        cnjNumber: onlyDigits(form.cnjNumber),
        title: form.title.trim(),
        subject: form.subject || null,
        court: form.court || null,
        tribunal: form.tribunal || null,
        priority: form.priority,
        openingDate: form.openingDate,
        clientId: form.clientId,
        assignedLawyerId: form.assignedLawyerId || null,
      };
      if (isEditing) {
        return casesService.update(legalCase!.id, {
          ...base,
          status: form.status,
          closingDate: form.status === "CLOSED" ? form.closingDate || null : null,
        });
      }
      return casesService.create(base);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      showToast(isEditing ? "Processo atualizado com sucesso." : "Processo cadastrado com sucesso.", "success");
      onClose();
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    },
  });

  return (
    <Modal title={isEditing ? "Editar processo" : "Novo processo"} isOpen={isOpen} onClose={onClose} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        noValidate
      >
        <div className="form-grid">
          <Input
            label="Número CNJ"
            required
            value={form.cnjNumber}
            maxLength={25}
            placeholder="0000000-00.0000.0.00.0000"
            onChange={(e) => setForm({ ...form, cnjNumber: e.target.value })}
            error={fieldErrors.cnjNumber}
            hint="20 dígitos numéricos."
          />
          <Input
            label="Título"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={fieldErrors.title}
          />
          <Input
            label="Assunto"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            error={fieldErrors.subject}
          />
          <Input
            label="Vara/Comarca"
            value={form.court}
            onChange={(e) => setForm({ ...form, court: e.target.value })}
            error={fieldErrors.court}
          />
          <Input
            label="Tribunal"
            value={form.tribunal}
            onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
            error={fieldErrors.tribunal}
          />
          <Select
            label="Prioridade"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as CasePriority })}
            error={fieldErrors.priority}
          >
            {Object.entries(CASE_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Data de abertura"
            type="date"
            required
            value={form.openingDate}
            onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
            error={fieldErrors.openingDate}
          />
          <Select
            label="Cliente"
            required
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            error={fieldErrors.clientId}
          >
            <option value="">Selecione...</option>
            {clientsPage?.content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {isAdmin && (
            <Select
              label="Advogado responsável"
              value={form.assignedLawyerId}
              onChange={(e) => setForm({ ...form, assignedLawyerId: e.target.value })}
              error={fieldErrors.assignedLawyerId}
            >
              <option value="">Nenhum</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.name}
                </option>
              ))}
            </Select>
          )}
          {isEditing && (
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LegalCaseStatus })}
              error={fieldErrors.status}
            >
              {Object.entries(LEGAL_CASE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
          {isEditing && form.status === "CLOSED" && (
            <Input
              label="Data de encerramento"
              type="date"
              required
              value={form.closingDate}
              onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
              error={fieldErrors.closingDate}
            />
          )}
        </div>

        {formError && <p className="auth-card__error">{formError}</p>}

        <div className="modal__actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? "Salvar alterações" : "Cadastrar processo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
