import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { UserCog, Eye } from "lucide-react";
import { usersService } from "@/services/users";
import { Badge } from "@/components/ui/Badge";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { PAGE_SIZE, ROLE_LABELS } from "@/constants";
import { formatDate } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";

export function UsersPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", { page }],
    queryFn: () => usersService.list(page, PAGE_SIZE),
  });

  return (
    <div className="page">
      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <TableContainer>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Criado em</th>
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
                data?.content.map((u) => (
                  <tr key={u.id}>
                    <td data-label="Nome">{u.name}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Perfil">{ROLE_LABELS[u.role]}</td>
                    <td data-label="Status">
                      <Badge tone={u.active ? "success" : "neutral"}>{u.active ? "Ativo" : "Inativo"}</Badge>
                    </td>
                    <td data-label="Criado em">{formatDate(u.createdAt)}</td>
                    <td data-label="Ações" className="table-actions">
                      <Link to={`/users/${u.id}`} className="icon-btn" title="Ver detalhes">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState icon={<UserCog size={40} />} title="Nenhum usuário encontrado" />
          )}

          {data && (
            <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
