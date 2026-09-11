import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = "primary", isLoading, icon, children, className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} ${className ?? ""}`.trim()}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Loader2 size={16} className="spin" /> : icon}
      {children}
    </button>
  );
}
