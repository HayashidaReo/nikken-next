"use client";

import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import type { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface FormInputProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "password" | "number";
  className?: string;
  trailingIcon?: React.ReactNode;
  onTrailingIconClick?: () => void;
  /** trailing icon の aria-label を渡す（任意） */
  trailingIconLabel?: string;
}

interface FormInputWithRegisterProps<T extends FieldValues> extends FormInputProps {
  register: UseFormRegister<T>;
}

interface FormTextareaProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}

interface FormTextareaWithRegisterProps<T extends FieldValues> extends FormTextareaProps {
  register: UseFormRegister<T>;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  error,
  required = false,
  placeholder,
  type = "text",
  className,
  trailingIcon,
  onTrailingIconClick,
  trailingIconLabel,
  register,
  ...props
}: FormInputWithRegisterProps<T>) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Input
        {...register(name as Path<T>)}
        id={name}
        type={type}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        trailingIcon={trailingIcon}
        onTrailingIconClick={onTrailingIconClick}
        trailingIconLabel={trailingIconLabel}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function FormTextarea<T extends FieldValues>({
  label,
  name,
  error,
  required = false,
  placeholder,
  rows = 3,
  className,
  register,
  ...props
}: FormTextareaWithRegisterProps<T>) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Textarea
        {...register(name as Path<T>)}
        id={name}
        placeholder={placeholder}
        rows={rows}
        className={error ? "border-red-500" : ""}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
