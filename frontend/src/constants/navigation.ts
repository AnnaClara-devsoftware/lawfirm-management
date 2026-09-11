import {
  LayoutDashboard,
  Users2,
  Briefcase,
  CalendarClock,
  CalendarDays,
  FileText,
  Bell,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[]; // se ausente, visível para qualquer role autenticada
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clientes", icon: Users2 },
  { to: "/cases", label: "Processos", icon: Briefcase },
  { to: "/deadlines", label: "Prazos", icon: CalendarClock },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/documents", label: "Documentos", icon: FileText },
  { to: "/notifications", label: "Notificações", icon: Bell },
  { to: "/users", label: "Usuários", icon: UserCog, roles: ["ADMIN"] },
  { to: "/audit-logs", label: "Auditoria", icon: ShieldCheck, roles: ["ADMIN"] },
];
