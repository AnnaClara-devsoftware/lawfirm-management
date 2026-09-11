import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { getErrorMessage, getFieldErrors } from "@/utils/errorMessage";
import type { RegisterRequest } from "@/types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "ADVOGADO",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);
    try {
      await register({ ...form, phone: form.phone || undefined });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível concluir o cadastro."));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Scale size={28} />
          <h1>Criar conta</h1>
          <p>Cadastre-se para acessar o sistema.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Nome completo"
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={fieldErrors.name}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <Input
            label="Senha"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            hint="Mínimo de 8 caracteres."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={fieldErrors.password}
          />
          <Input
            label="Telefone"
            name="phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={fieldErrors.phone}
          />
          <Select
            label="Perfil de acesso"
            name="role"
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as RegisterRequest["role"] })}
            error={fieldErrors.role}
          >
            <option value="ADVOGADO">Advogado(a)</option>
            <option value="ASSISTENTE">Assistente</option>
          </Select>

          {error && <p className="auth-card__error">{error}</p>}

          <Button type="submit" isLoading={isLoading} icon={<UserPlus size={16} />} className="auth-card__submit">
            Criar conta
          </Button>
        </form>

        <p className="auth-card__footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
