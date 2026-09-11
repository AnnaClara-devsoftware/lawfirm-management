import type { ReactNode } from "react";

export function TableContainer({ children }: { children: ReactNode }) {
  return (
    <div className="table-container">
      <table className="table">{children}</table>
    </div>
  );
}
