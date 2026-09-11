import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="full-page-center">
      <div className="empty-state">
        <CompassIcon size={40} />
        <h3>Página não encontrada</h3>
        <p>O endereço acessado não existe ou foi movido.</p>
        <Link to="/">
          <Button>Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
