import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
          {rest.required && <span className="field__required"> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`field__input ${error ? "field__input--error" : ""} ${className ?? ""}`.trim()}
        aria-invalid={!!error}
        {...rest}
      />
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
});
