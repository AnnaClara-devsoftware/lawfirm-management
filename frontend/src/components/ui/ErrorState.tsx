import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <AlertCircle size={40} />
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={<RotateCw size={16} />}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
