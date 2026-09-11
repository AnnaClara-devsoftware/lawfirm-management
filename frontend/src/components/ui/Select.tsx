import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...rest },
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
      <select
        ref={ref}
        id={inputId}
        className={`field__input field__select ${error ? "field__input--error" : ""} ${className ?? ""}`.trim()}
        aria-invalid={!!error}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
});
