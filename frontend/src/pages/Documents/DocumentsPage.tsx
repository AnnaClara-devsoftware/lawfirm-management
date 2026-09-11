import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Download, Trash2, FileText } from "lucide-react";
import { documentsService } from "@/services/documents";
import { casesService } from "@/services/cases";
import { clientsService } from "@/services/clients";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { TableContainer } from "@/components/tables/TableContainer";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { MAX_UPLOAD_SIZE_BYTES, PAGE_SIZE } from "@/constants";
import { formatDateTime, formatFileSize } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorMessage";
import type { DocumentResponse } from "@/types";

export function DocumentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(0);
  const [legalCaseId, setLegalCaseId] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentResponse | null>(null);

  const { data: casesPage } = useQuery({
    queryKey: ["cases", "dropdown"],
    queryFn: () => casesService.list({ page: 0, size: 100 }),
  });
  const { data: clientsPage } = useQuery({
    queryKey: ["clients", "dropdown"],
    queryFn: () => clientsService.list({ page: 0, size: 100, active: true }),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["documents", { page, legalCaseId, clientId }],
    queryFn: () => documentsService.list({ page, size: PAGE_SIZE, legalCaseId, clientId }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      setUploadProgress(0);
      return documentsService.upload(
        { file, legalCaseId: legalCaseId || undefined, clientId: clientId || undefined, description },
        setUploadProgress,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      showToast("Documento enviado com sucesso.", "success");
      setDescription("");
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setUploadProgress(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      showToast("Documento excluído.", "success");
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(getErrorMessage(err), "error");
      setDeleteTarget(null);
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      showToast("Arquivo maior que o limite permitido (10 MB).", "error");
      e.target.value = "";
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      await documentsService.download(doc.id, doc.originalFilename);
    } catch (err) {
      showToast(getErrorMessage(err, "Não foi possível baixar o documento."), "error");
    }
  };

  const canDelete = (doc: DocumentResponse) => user?.role === "ADMIN" || doc.uploadedBy === user?.id;

  return (
    <div className="page">
      <Card className="upload-card">
        <div className="upload-card__filters">
          <Select value={legalCaseId} onChange={(e) => { setLegalCaseId(e.target.value); setPage(0); }} aria-label="Filtrar por processo">
            <option value="">Todos os processos</option>
            {casesPage?.content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Select value={clientId} onChange={(e) => { setClientId(e.target.value); setPage(0); }} aria-label="Filtrar por cliente">
            <option value="">Todos os clientes</option>
            {clientsPage?.content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="upload-card__dropzone">
          <Input
            label="Descrição do documento (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Petição inicial"
          />
          <input ref={fileInputRef} type="file" onChange={handleFileChange} disabled={uploadMutation.isPending} />
          <Button icon={<UploadCloud size={16} />} isLoading={uploadMutation.isPending} onClick={() => fileInputRef.current?.click()} type="button">
            Enviar documento
          </Button>
          {uploadProgress !== null && (
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
          <small>Tamanho máximo: 10 MB.</small>
        </div>
      </Card>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <TableContainer>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Descrição</th>
                <th>Tamanho</th>
                <th>Enviado em</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}
              {!isLoading &&
                data?.content.map((doc) => (
                  <tr key={doc.id}>
                    <td data-label="Arquivo">{doc.originalFilename}</td>
                    <td data-label="Descrição">{doc.description || "—"}</td>
                    <td data-label="Tamanho">{formatFileSize(doc.fileSize)}</td>
                    <td data-label="Enviado em">{formatDateTime(doc.createdAt)}</td>
                    <td data-label="Ações" className="table-actions">
                      <button type="button" className="icon-btn" title="Baixar" onClick={() => void handleDownload(doc)}>
                        <Download size={16} />
                      </button>
                      {canDelete(doc) && (
                        <button type="button" className="icon-btn" title="Excluir" onClick={() => setDeleteTarget(doc)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </TableContainer>

          {!isLoading && data?.content.length === 0 && (
            <EmptyState icon={<FileText size={40} />} title="Nenhum documento encontrado" description="Envie o primeiro documento usando o formulário acima." />
          )}

          {data && (
            <Pagination page={data.number} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir documento"
        message={`Tem certeza que deseja excluir "${deleteTarget?.originalFilename}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
