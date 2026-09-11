// Tipos gerados a partir da leitura direta dos DTOs (records) do backend.
// Nomes de campo e enums são espelhados exatamente como o Jackson serializa.

// ---------- Envelope genérico (Spring Data Page) ----------
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (0-based)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: ApiFieldError[] | null;
}

// ---------- Enums ----------
export type Role = "ADMIN" | "ADVOGADO" | "ASSISTENTE";

export type LegalCaseStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type CasePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type DeadlineStatus = "PENDING" | "COMPLETED" | "CANCELLED";
export type DeadlinePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type AppointmentType = "HEARING" | "MEETING" | "CONSULTATION" | "OTHER";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type NotificationType = "DEADLINE_REMINDER" | "APPOINTMENT_REMINDER" | "SYSTEM";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "LOGIN"
  | "LOGOUT"
  | "COMPLETE"
  | "PASSWORD_CHANGE";

// ---------- Auth / Users ----------
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role: Extract<Role, "ADVOGADO" | "ASSISTENTE">;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateRoleRequest {
  role: Role;
}

// ---------- Clientes ----------
export interface ClientResponse {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  active: boolean;
  assignedLawyerId: string | null;
  assignedLawyerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  assignedLawyerId?: string | null;
}

export type UpdateClientRequest = CreateClientRequest;

export interface ClientFormValues {
  name: string;
  document: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  assignedLawyerId: string | null;
}

// ---------- Processos jurídicos ----------
export interface LegalCaseResponse {
  id: string;
  cnjNumber: string;
  title: string;
  subject: string | null;
  court: string | null;
  tribunal: string | null;
  status: LegalCaseStatus;
  priority: CasePriority;
  openingDate: string;
  closingDate: string | null;
  clientId: string;
  clientName: string;
  assignedLawyerId: string | null;
  assignedLawyerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegalCaseRequest {
  cnjNumber: string;
  title: string;
  subject?: string | null;
  court?: string | null;
  tribunal?: string | null;
  priority?: CasePriority | null;
  openingDate: string;
  clientId: string;
  assignedLawyerId?: string | null;
}

export interface UpdateLegalCaseRequest extends CreateLegalCaseRequest {
  status: LegalCaseStatus;
  priority: CasePriority;
  closingDate?: string | null;
}

// ---------- Prazos ----------
export interface DeadlineResponse {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: DeadlineStatus;
  priority: DeadlinePriority;
  overdue: boolean;
  completedAt: string | null;
  legalCaseId: string;
  legalCaseCnj: string;
  legalCaseTitle: string;
  clientId: string | null;
  clientName: string | null;
  assignedLawyerId: string | null;
  assignedLawyerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeadlineRequest {
  title: string;
  description?: string | null;
  dueDate: string;
  priority?: DeadlinePriority | null;
  legalCaseId: string;
}

export interface UpdateDeadlineRequest {
  title: string;
  description?: string | null;
  dueDate: string;
  status: DeadlineStatus;
  priority: DeadlinePriority;
  legalCaseId: string;
}

// ---------- Compromissos (Agenda) ----------
export interface AppointmentResponse {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  assignedUserId: string | null;
  assignedUserName: string | null;
  legalCaseId: string | null;
  clientId: string | null;
}

export interface CreateAppointmentRequest {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  type?: AppointmentType | null;
  assignedUserId?: string | null;
  legalCaseId?: string | null;
  clientId?: string | null;
}

export interface UpdateAppointmentRequest extends CreateAppointmentRequest {
  status: AppointmentStatus;
}

// ---------- Documentos ----------
export interface DocumentResponse {
  id: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  sha256: string;
  description: string | null;
  legalCaseId: string | null;
  clientId: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Notificações ----------
export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

// ---------- Dashboard ----------
export interface DashboardResponse {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  activeClients: number;
  totalCases: number;
  activeCases: number;
  pendingDeadlines: number;
  overdueDeadlines: number;
  upcomingAppointments: number;
  unreadNotifications: number;
}

// ---------- Auditoria ----------
export interface AuditLogResponse {
  id: string;
  userId: string | null;
  action: AuditAction;
  entityName: string;
  entityId: string | null;
  description: string;
  createdAt: string;
}
