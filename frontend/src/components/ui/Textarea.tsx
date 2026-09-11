import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className, ...rest },
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
      <textarea
        ref={ref}
        id={inputId}
        className={`field__input field__textarea ${error ? "field__input--error" : ""} ${className ?? ""}`.trim()}
        aria-invalid={!!error}
        {...rest}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
});
