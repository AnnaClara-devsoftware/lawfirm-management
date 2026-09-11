import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { clientsService } from "@/services/clients";
import { usersService } from "@/services/users";
import { getErrorMessage, getFieldErrors } from "@/utils/errorMessage";
import { onlyDigits } from "@/utils/formatters";
import type { ClientFormValues, ClientResponse } from "@/types";

const EMPTY_FORM: ClientFormValues = {
  name: "",
  document: "",
  email: "",
  phone: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  assignedLawyerId: null,
};

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientResponse | null; // null = criação
}

export function ClientFormModal({ isOpen, onClose, client }: ClientFormModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ClientFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = !!client;
  const isAdmin = user?.role === "ADMIN";

  // Apenas ADMIN pode reatribuir livremente o advogado responsável;
  // um ADVOGADO sempre atribui a si mesmo (regra aplicada no backend).
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
    if (client) {
      setForm({
        name: client.name,
        document: client.document ?? "",
        email: client.email ?? "",
        phone: client.phone ?? "",
        street: client.street ?? "",
        number: client.number ?? "",
        complement: client.complement ?? "",
        neighborhood: client.neighborhood ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zipCode: client.zipCode ?? "",
        assignedLawyerId: client.assignedLawyerId,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [client, isOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        document: onlyDigits(form.document) || null,
        email: form.email || null,
        phone: form.phone || null,
        street: form.street || null,
        number: form.number || null,
        complement: form.complement || null,
        neighborhood: form.neighborhood || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: onlyDigits(form.zipCode) || null,
        assignedLawyerId: form.assignedLawyerId || null,
      };
      return isEditing ? clientsService.update(client!.id, payload) : clientsService.create(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
      showToast(isEditing ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.", "success");
      onClose();
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    },
  });

  return (
    <Modal title={isEditing ? "Editar cliente" : "Novo cliente"} isOpen={isOpen} onClose={onClose} size="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        noValidate
      >
        <div className="form-grid">
          <Input
            label="Nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={fieldErrors.name}
          />
          <Input
            label="Documento (CPF/CNPJ)"
            value={form.document}
            maxLength={18}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            error={fieldErrors.document}
            hint="Apenas números — 11 (CPF) ou 14 (CNPJ) dígitos."
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={fieldErrors.phone}
          />
          <Input
            label="Logradouro"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            error={fieldErrors.street}
          />
          <Input
            label="Número"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            error={fieldErrors.number}
          />
          <Input
            label="Complemento"
            value={form.complement}
            onChange={(e) => setForm({ ...form, complement: e.target.value })}
            error={fieldErrors.complement}
          />
          <Input
            label="Bairro"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            error={fieldErrors.neighborhood}
          />
          <Input
            label="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            error={fieldErrors.city}
          />
          <Input
            label="UF"
            value={form.state}
            maxLength={2}
            onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
            error={fieldErrors.state}
          />
          <Input
            label="CEP"
            value={form.zipCode}
            maxLength={9}
            onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
            error={fieldErrors.zipCode}
          />
          {isAdmin && (
            <Select
              label="Advogado responsável"
              value={form.assignedLawyerId ?? ""}
              onChange={(e) => setForm({ ...form, assignedLawyerId: e.target.value || null })}
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
        </div>

        {formError && <p className="auth-card__error">{formError}</p>}

        <div className="modal__actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
