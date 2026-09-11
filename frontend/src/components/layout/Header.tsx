import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Bell, LogOut, ChevronDown, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { notificationsService } from "@/services/notifications";
import { NAV_ITEMS } from "@/constants/navigation";
import { ROLE_LABELS } from "@/constants";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = NAV_ITEMS.find((item) => item.to === location.pathname)?.label ?? "";

  return (
    <header className="header">
      <div className="header__left">
        <button type="button" className="header__menu-btn" onClick={onMenuClick} aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        {currentLabel && <h1 className="header__title">{currentLabel}</h1>}
      </div>

      <div className="header__right">
        <Link to="/notifications" className="header__icon-btn" aria-label="Notificações">
          <Bell size={20} />
          {!!unreadCount && unreadCount > 0 && (
            <span className="header__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </Link>

        <div className="header__user" ref={menuRef}>
          <button type="button" className="header__user-btn" onClick={() => setMenuOpen((v) => !v)}>
            <span className="avatar">
              <UserRound size={18} />
            </span>
            <span className="header__user-info">
              <strong>{user?.name}</strong>
              <small>{user ? ROLE_LABELS[user.role] : ""}</small>
            </span>
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <div className="header__dropdown">
              <Link to={`/users/${user?.id}`} onClick={() => setMenuOpen(false)}>
                Meu perfil
              </Link>
              <button type="button" onClick={() => void logout()}>
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
