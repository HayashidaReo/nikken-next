"use client";

import { ReactNode } from "react";

interface NotFoundLayoutProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  actions: ReactNode;
  footer?: ReactNode;
  containerClassName?: string;
  maxWidth?: "sm" | "md" | "lg";
}

export function NotFoundLayout({
  icon,
  title,
  subtitle,
  description,
  actions,
  footer,
  containerClassName = "",
  maxWidth = "md",
}: NotFoundLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div
        className={`${maxWidthClasses[maxWidth]} w-full text-center ${containerClassName}`}
      >
        <div className="mb-8">
          <div className="flex justify-center mb-4">{icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {subtitle}
            </h2>
          )}
          <p className="text-gray-600 mb-6">{description}</p>
        </div>

        <div className="space-y-4 mb-8">{actions}</div>

        {footer && <div className="text-sm text-gray-500">{footer}</div>}
      </div>
    </div>
  );
}
