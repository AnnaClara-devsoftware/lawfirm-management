import { useContext } from "react";
import { ToastContext } from "@/components/feedback/ToastProvider";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider.");
  }
  return ctx;
}
