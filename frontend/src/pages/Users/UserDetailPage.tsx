import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, KeyRound, Ban, CheckCircle2 } from "lucide-react";
import { usersService } from "@/services/users";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ROLE_LABELS } from "@/constants";
import { formatDate } from "@/utils/formatters";
import { getErrorMessage, getFieldErrors } from "@/utils/errorMessage";
import type { Role } from "@/types";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshCurrentUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const isSelf = currentUser?.id === id;
  const isAdmin = currentUser?.role === "ADMIN";

  const { data: targetUser, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", id],
    queryFn: () => usersService.findById(id!),
    enabled: !!id,
  });

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [roleValue, setRoleValue] = useState<Role>("ASSISTENTE");
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (targetUser) {
      setProfileForm({ name: targetUser.name, phone: targetUser.phone ?? "" });
      setRoleValue(targetUser.role);
    }
  }, [targetUser]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["users"] });
    if (isSelf) void refreshCurrentUser();
  };

  const profileMutation = useMutation({
    mutationFn: () => usersService.updateProfile(id!, { name: profileForm.name.trim(), phone: profileForm.phone || null }),
    onSuccess: () => {
      invalidateAll();
      showToast("Perfil atualizado com sucesso.", "success");
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setProfileErrors(getFieldErrors(err));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => usersService.changePassword(id!, passwordForm),
    onSuccess: () => {
      showToast("Senha alterada com sucesso.", "success");
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setPasswordErrors({});
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setPasswordErrors(getFieldErrors(err));
    },
  });

  const roleMutation = useMutation({
    mutationFn: () => usersService.updateRole(id!, { role: roleValue }),
    onSuccess: () => {
      invalidateAll();
      showToast("Perfil de acesso atualizado.", "success");
    },
    onError: (err) => showToast(getErrorMessage(err), "error"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => (targetUser?.active ? usersService.deactivate(id!) : usersService.activate(id!)),
    onSuccess: () => {
      invalidateAll();
      showToast(targetUser?.active ? "Usuário desativado." : "Usuário ativado.", "success");
      setToggleConfirmOpen(false);
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setToggleConfirmOpen(false);
    },
  });

  if (isLoading) return <Spinner label="Carregando usuário..." />;
  if (isError || !targetUser) return <ErrorState message={getErrorMessage(error, "Usuário não encontrado.")} onRetry={() => void refetch()} />;

  return (
    <div className="page page--narrow">
      <Card>
        <div className="user-detail__header">
          <div>
            <h2>{targetUser.name}</h2>
            <p>{targetUser.email}</p>
          </div>
          <div className="user-detail__badges">
            <Badge tone={targetUser.active ? "success" : "neutral"}>{targetUser.active ? "Ativo" : "Inativo"}</Badge>
            <Badge tone="neutral">{ROLE_LABELS[targetUser.role]}</Badge>
          </div>
        </div>
        <p className="user-detail__meta">Cadastrado em {formatDate(targetUser.createdAt)}</p>
      </Card>

      {(isSelf || isAdmin) && (
        <Card>
          <h3>Dados do perfil</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profileMutation.mutate();
            }}
            noValidate
          >
            <div className="form-grid">
              <Input
                label="Nome"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                error={profileErrors.name}
              />
              <Input
                label="Telefone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                error={profileErrors.phone}
              />
            </div>
            <Button type="submit" icon={<Save size={16} />} isLoading={profileMutation.isPending}>
              Salvar alterações
            </Button>
          </form>
        </Card>
      )}

      {isSelf && (
        <Card>
          <h3>Alterar senha</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              passwordMutation.mutate();
            }}
            noValidate
          >
            <div className="form-grid">
              <Input
                label="Senha atual"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                error={passwordErrors.currentPassword}
              />
              <Input
                label="Nova senha"
                type="password"
                required
                minLength={8}
                hint="Mínimo de 8 caracteres."
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                error={passwordErrors.newPassword}
              />
            </div>
            <Button type="submit" icon={<KeyRound size={16} />} isLoading={passwordMutation.isPending}>
              Alterar senha
            </Button>
          </form>
        </Card>
      )}

      {isAdmin && !isSelf && (
        <Card>
          <h3>Administração</h3>
          <div className="form-grid">
            <Select label="Perfil de acesso" value={roleValue} onChange={(e) => setRoleValue(e.target.value as Role)}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="user-detail__admin-actions">
            <Button onClick={() => roleMutation.mutate()} isLoading={roleMutation.isPending} disabled={roleValue === targetUser.role}>
              Atualizar perfil de acesso
            </Button>
            <Button
              variant={targetUser.active ? "danger" : "secondary"}
              icon={targetUser.active ? <Ban size={16} /> : <CheckCircle2 size={16} />}
              onClick={() => setToggleConfirmOpen(true)}
            >
              {targetUser.active ? "Desativar usuário" : "Ativar usuário"}
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={toggleConfirmOpen}
        title={targetUser.active ? "Desativar usuário" : "Ativar usuário"}
        message={`Tem certeza que deseja ${targetUser.active ? "desativar" : "ativar"} "${targetUser.name}"?`}
        confirmLabel={targetUser.active ? "Desativar" : "Ativar"}
        tone={targetUser.active ? "danger" : "primary"}
        isLoading={toggleActiveMutation.isPending}
        onConfirm={() => toggleActiveMutation.mutate()}
        onCancel={() => setToggleConfirmOpen(false)}
      />
    </div>
  );
}
