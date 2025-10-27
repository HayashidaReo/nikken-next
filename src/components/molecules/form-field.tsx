"use client";

import * as React from "react";
import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormInputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  register?: (name: string) => Record<string, unknown>;
}

export function FormInputField({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required = false,
  className,
  register,
}: FormInputFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={className}
    >
      <Input
        type={type}
        placeholder={placeholder}
        {...(register ? register(name as never) : { name })}
      />
    </FormField>
  );
}
