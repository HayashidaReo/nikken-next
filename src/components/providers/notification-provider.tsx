"use client";

import * as React from "react";
import { ToastContainer } from "@/components/molecules/toast";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationContext = React.createContext<ReturnType<
  typeof useNotifications
> | null>(null);

export function useToast() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useToast must be used within a NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export function NotificationProvider({
  children,
  position = "top-right",
}: NotificationProviderProps) {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
      <ToastContainer
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
        position={position}
      />
    </NotificationContext.Provider>
  );
}
