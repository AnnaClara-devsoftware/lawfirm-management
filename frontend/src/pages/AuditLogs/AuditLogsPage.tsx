import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { auditService } from "@/services/audit";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { AUDIT_ACTION_LABELS, PAGE_SIZE } from "@/constants";
import { formatDateTime } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";
import type { AuditAction } from "@/types";

export function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<AuditAction | "">("");
  const [entityName, setEntityName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["audit-logs", { page, action, entityName, from, to }],
    queryFn: () => auditService.search({ page, size: PAGE_SIZE, action, entityName, from, to }),
  });

  return (
    <div className="page">
      <div className="page__toolbar page__toolbar--wrap">
        <Select
          value={action}
          onChange={(e) => {
            setAction(e.target.value as AuditAction | "");
            setPage(0);
          }}
          aria-label="Filtrar por ação"
        >
          <option value="">Todas as ações</option>
          {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Entidade (ex: LegalCase)"
          value={entityName}
          onChange={(e) => {
            setEntityName(e.target.value);
            setPage(0);
          }}
        />
        <Input
          type="date"
          aria-label="De"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(0);
          }}
        />
        <Input
          type="date"
          aria-label="Até"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <TableContainer>
            <thead>
              <tr>
                <th>Data/hora</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>ID da entidade</th>
                <th>Descrição</th>
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
                data?.content.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Data/hora">{formatDateTime(log.createdAt)}</td>
                    <td data-label="Ação">
                      <Badge tone="neutral">{AUDIT_ACTION_LABELS[log.action]}</Badge>
                    </td>
                    <td data-label="Entidade">{log.entityName}</td>
                    <td data-label="ID da entidade">
                      <code>{log.entityId ?? "—"}</code>
                    </td>
                    <td data-label="Descrição">{log.description}</td>
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState icon={<ShieldCheck size={40} />} title="Nenhum registro encontrado" description="Ajuste os filtros para ver mais resultados." />
          )}

          {data && (
            <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
