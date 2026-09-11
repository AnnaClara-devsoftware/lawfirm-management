import { http } from "@/services/api";
import type { DocumentResponse, Page } from "@/types";

export interface DocumentListParams {
  page: number;
  size: number;
  legalCaseId?: string;
  clientId?: string;
}

export interface UploadDocumentPayload {
  file: File;
  legalCaseId?: string;
  clientId?: string;
  description?: string;
}

export const documentsService = {
  list: ({ page, size, legalCaseId, clientId }: DocumentListParams) =>
    http
      .get<Page<DocumentResponse>>("/documents", {
        params: { page, size, legalCaseId: legalCaseId || undefined, clientId: clientId || undefined },
      })
      .then((r) => r.data),

  upload: ({ file, legalCaseId, clientId, description }: UploadDocumentPayload, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    if (legalCaseId) formData.append("legalCaseId", legalCaseId);
    if (clientId) formData.append("clientId", clientId);
    if (description) formData.append("description", description);

    return http
      .post<DocumentResponse>("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      })
      .then((r) => r.data);
  },

  download: (id: string, filename: string) =>
    http.get(`/documents/${id}/download`, { responseType: "blob" }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),

  delete: (id: string) => http.delete<void>(`/documents/${id}`).then((r) => r.data),
};
