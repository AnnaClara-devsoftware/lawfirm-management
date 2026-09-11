import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Ban, CheckCircle2, Users2 } from "lucide-react";
import { clientsService } from "@/services/clients";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/forms/SearchInput";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ClientFormModal } from "@/pages/Clients/ClientFormModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { CAN_MANAGE_CASES, PAGE_SIZE } from "@/constants";
import { formatDocument } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";
import type { ClientResponse } from "@/types";

export function ClientsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const canManage = !!user && CAN_MANAGE_CASES.includes(user.role);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ClientResponse | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["clients", { page, search, activeFilter }],
    queryFn: () =>
      clientsService.list({
        page,
        size: PAGE_SIZE,
        search,
        active: activeFilter === "" ? undefined : activeFilter === "true",
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (target: ClientResponse) =>
      target.active ? clientsService.deactivate(target.id) : clientsService.activate(target.id),
    onSuccess: (_data, target) => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
      showToast(target.active ? "Cliente desativado." : "Cliente ativado.", "success");
      setToggleTarget(null);
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setToggleTarget(null);
    },
  });

  const openCreate = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const openEdit = (client: ClientResponse) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  return (
    <div className="page">
      <div className="page__toolbar">
        <SearchInput placeholder="Buscar por nome ou documento..." onSearch={(value) => { setSearch(value); setPage(0); }} />
        <Select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value as "" | "true" | "false");
            setPage(0);
          }}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </Select>
        {canManage && (
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Novo cliente
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
                <th>Nome</th>
                <th>Documento</th>
                <th>Contato</th>
                <th>Advogado responsável</th>
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
                data?.content.map((client) => (
                  <tr key={client.id}>
                    <td data-label="Nome">{client.name}</td>
                    <td data-label="Documento">{formatDocument(client.document)}</td>
                    <td data-label="Contato">
                      <div className="cell-stack">
                        <span>{client.email || "—"}</span>
                        <small>{client.phone || "—"}</small>
                      </div>
                    </td>
                    <td data-label="Advogado responsável">{client.assignedLawyerName || "—"}</td>
                    <td data-label="Status">
                      <Badge tone={client.active ? "success" : "neutral"}>{client.active ? "Ativo" : "Inativo"}</Badge>
                    </td>
                    {canManage && (
                      <td data-label="Ações" className="table-actions">
                        <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(client)}>
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title={client.active ? "Desativar" : "Ativar"}
                          onClick={() => setToggleTarget(client)}
                        >
                          {client.active ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState
              icon={<Users2 size={40} />}
              title="Nenhum cliente encontrado"
              description={search || activeFilter ? "Ajuste os filtros para ver mais resultados." : "Cadastre o primeiro cliente do escritório."}
            />
          )}

          {data && (
            <Pagination
              page={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ClientFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} client={editingClient} />

      <ConfirmDialog
        isOpen={!!toggleTarget}
        title={toggleTarget?.active ? "Desativar cliente" : "Ativar cliente"}
        message={`Tem certeza que deseja ${toggleTarget?.active ? "desativar" : "ativar"} "${toggleTarget?.name}"?`}
        confirmLabel={toggleTarget?.active ? "Desativar" : "Ativar"}
        tone={toggleTarget?.active ? "danger" : "primary"}
        isLoading={toggleMutation.isPending}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget)}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
