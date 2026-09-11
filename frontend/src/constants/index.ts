import type {
  AppointmentStatus,
  AppointmentType,
  AuditAction,
  CasePriority,
  DeadlinePriority,
  DeadlineStatus,
  LegalCaseStatus,
  NotificationType,
  Role,
} from "@/types";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  ADVOGADO: "Advogado(a)",
  ASSISTENTE: "Assistente",
};

export const LEGAL_CASE_STATUS_LABELS: Record<LegalCaseStatus, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  CLOSED: "Encerrado",
};

export const LEGAL_CASE_STATUS_TONE: Record<LegalCaseStatus, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  CLOSED: "neutral",
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  PENDING: "Pendente",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const DEADLINE_STATUS_TONE: Record<DeadlineStatus, "success" | "warning" | "neutral"> = {
  PENDING: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
};

export const DEADLINE_PRIORITY_LABELS: Record<DeadlinePriority, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_TONE: Record<CasePriority | DeadlinePriority, "success" | "warning" | "danger" | "neutral"> = {
  LOW: "neutral",
  NORMAL: "success",
  HIGH: "warning",
  URGENT: "danger",
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  HEARING: "Audiência",
  MEETING: "Reunião",
  CONSULTATION: "Consulta",
  OTHER: "Outro",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const APPOINTMENT_STATUS_TONE: Record<AppointmentStatus, "success" | "warning" | "neutral"> = {
  SCHEDULED: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  DEADLINE_REMINDER: "Lembrete de prazo",
  APPOINTMENT_REMINDER: "Lembrete de compromisso",
  SYSTEM: "Sistema",
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Exclusão",
  ACTIVATE: "Ativação",
  DEACTIVATE: "Desativação",
  LOGIN: "Login",
  LOGOUT: "Logout",
  COMPLETE: "Conclusão",
  PASSWORD_CHANGE: "Alteração de senha",
};

/** Roles que podem criar/editar clientes, processos e prazos. */
export const CAN_MANAGE_CASES: Role[] = ["ADMIN", "ADVOGADO"];

/** Tamanho máximo de upload de documento, em bytes (espelha application.yml: 10MB). */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const PAGE_SIZE = 10;
