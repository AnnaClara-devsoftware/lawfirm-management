import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Briefcase } from "lucide-react";
import { casesService } from "@/services/cases";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/forms/SearchInput";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { CaseFormModal } from "@/pages/Cases/CaseFormModal";
import { useAuth } from "@/hooks/useAuth";
import { CAN_MANAGE_CASES, CASE_PRIORITY_LABELS, LEGAL_CASE_STATUS_LABELS, LEGAL_CASE_STATUS_TONE, PAGE_SIZE, PRIORITY_TONE } from "@/constants";
import { formatCnj, formatDate } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";
import type { LegalCaseResponse, LegalCaseStatus } from "@/types";

export function CasesPage() {
  const { user } = useAuth();
  const canManage = !!user && CAN_MANAGE_CASES.includes(user.role);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LegalCaseStatus | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCaseResponse | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cases", { page, search, statusFilter }],
    queryFn: () => casesService.list({ page, size: PAGE_SIZE, search, status: statusFilter }),
  });

  const openCreate = () => {
    setEditingCase(null);
    setFormOpen(true);
  };

  const openEdit = (item: LegalCaseResponse) => {
    setEditingCase(item);
    setFormOpen(true);
  };

  return (
    <div className="page">
      <div className="page__toolbar">
        <SearchInput placeholder="Buscar por título ou nº CNJ..." onSearch={(value) => { setSearch(value); setPage(0); }} />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as LegalCaseStatus | "");
            setPage(0);
          }}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          {Object.entries(LEGAL_CASE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {canManage && (
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Novo processo
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
                <th>Nº CNJ</th>
                <th>Título</th>
                <th>Cliente</th>
                <th>Advogado</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Abertura</th>
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
                  <tr key={item.id}>
                    <td data-label="Nº CNJ">{formatCnj(item.cnjNumber)}</td>
                    <td data-label="Título">{item.title}</td>
                    <td data-label="Cliente">{item.clientName}</td>
                    <td data-label="Advogado">{item.assignedLawyerName || "—"}</td>
                    <td data-label="Prioridade">
                      <Badge tone={PRIORITY_TONE[item.priority]}>{CASE_PRIORITY_LABELS[item.priority]}</Badge>
                    </td>
                    <td data-label="Status">
                      <Badge tone={LEGAL_CASE_STATUS_TONE[item.status]}>{LEGAL_CASE_STATUS_LABELS[item.status]}</Badge>
                    </td>
                    <td data-label="Abertura">{formatDate(item.openingDate)}</td>
                    {canManage && (
                      <td data-label="Ações" className="table-actions">
                        <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(item)}>
                          <Pencil size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState
              icon={<Briefcase size={40} />}
              title="Nenhum processo encontrado"
              description={search || statusFilter ? "Ajuste os filtros para ver mais resultados." : "Cadastre o primeiro processo jurídico."}
            />
          )}

          {data && (
            <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          )}
        </>
      )}

      <CaseFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} legalCase={editingCase} />
    </div>
  );
}
