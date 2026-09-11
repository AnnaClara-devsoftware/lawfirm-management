import { Loader2 } from "lucide-react";

export function Spinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="spinner">
      <Loader2 size={28} className="spin" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      <td colSpan={100}>
        <div className="skeleton-bar" />
      </td>
    </tr>
  );
}
