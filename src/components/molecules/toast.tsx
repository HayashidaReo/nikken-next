"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Notification, NotificationType } from "@/hooks/useNotifications";

interface ToastProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

const toastVariants: Record<
    NotificationType,
    {
        className: string;
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    success: {
        className: "bg-green-50 border-green-200 text-green-800",
        icon: CheckCircle,
    },
    error: {
        className: "bg-red-50 border-red-200 text-red-800",
        icon: AlertCircle,
    },
    warning: {
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        icon: AlertTriangle,
    },
    info: {
        className: "bg-blue-50 border-blue-200 text-blue-800",
        icon: Info,
    },
};

export function Toast({ notification, onRemove }: ToastProps) {
    const { className, icon: Icon } = toastVariants[notification.type];

    React.useEffect(() => {
        const duration = notification.duration ?? 5000;
        if (duration > 0) {
            const timer = setTimeout(() => {
                onRemove(notification.id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [notification.id, notification.duration, onRemove]);

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out",
                "transform translate-x-0 opacity-100",
                "hover:shadow-xl",
                className
            )}
            role="alert"
        >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />

            <div className="flex-1 min-w-0">
                <div className="text-sm">{notification.message}</div>
            </div>

            <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors"
                aria-label="通知を閉じる"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    notifications: Notification[];
    onRemove: (id: string) => void;
    position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const positionClasses: Record<string, string> = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
};

export function ToastContainer({
    notifications,
    onRemove,
    position = "top-right",
}: ToastContainerProps) {
    if (notifications.length === 0) return null;

    return (
        <div
            className={cn(
                "fixed z-50 flex flex-col gap-2 max-w-sm w-full",
                positionClasses[position]
            )}
        >
            {notifications.map(notification => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
}
