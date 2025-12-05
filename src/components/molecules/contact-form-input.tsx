"use client";

import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { AlertCircle } from "lucide-react";

interface ContactFormInputProps {
    label: string;
    error?: FieldError;
    registration: UseFormRegisterReturn;
    placeholder: string;
    type?: string;
    multiline?: boolean;
    required?: boolean;
    rows?: number;
}

export function ContactFormInput({
    label,
    error,
    registration,
    placeholder,
    type = "text",
    multiline = false,
    required = false,
    rows = 5,
}: ContactFormInputProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={registration.name} className="text-sm font-medium text-lp-text-muted">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {multiline ? (
                <textarea
                    id={registration.name}
                    rows={rows}
                    className={`w-full bg-lp-bg/50 border ${error ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-lp-text focus:outline-none focus:border-lp-primary/50 focus:ring-1 focus:ring-lp-primary/50 transition-all resize-none`}
                    placeholder={placeholder}
                    {...registration}
                />
            ) : (
                <input
                    id={registration.name}
                    type={type}
                    className={`w-full bg-lp-bg/50 border ${error ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-lp-text focus:outline-none focus:border-lp-primary/50 focus:ring-1 focus:ring-lp-primary/50 transition-all`}
                    placeholder={placeholder}
                    {...registration}
                />
            )}
            {error && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error.message}
                </p>
            )}
        </div>
    );
}
