"use client";

import * as React from "react";
import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils/utils";

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-5 w-2 bg-blue-600 rounded-full" />
          <Label className="text-base font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        {description && (
          <p className="text-sm text-gray-500 ml-4">{description}</p>
        )}
      </div>
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
