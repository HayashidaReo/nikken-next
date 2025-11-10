"use client";

import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";

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
}

interface FormInputWithRegisterProps extends FormInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
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

interface FormTextareaWithRegisterProps extends FormTextareaProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
}

export function FormInput({
  label,
  name,
  error,
  required = false,
  placeholder,
  type = "text",
  className,
  trailingIcon,
  onTrailingIconClick,
  register,
  ...props
}: FormInputWithRegisterProps) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        trailingIcon={trailingIcon}
        onTrailingIconClick={onTrailingIconClick}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  error,
  required = false,
  placeholder,
  rows = 3,
  className,
  register,
  ...props
}: FormTextareaWithRegisterProps) {
  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Textarea
        {...register(name)}
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
