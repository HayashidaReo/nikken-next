"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/providers/notification-provider";
import { cn } from "@/lib/utils/utils";

interface LogoutButtonProps {
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

/**
 * ログアウト機能を提供するボタンコンポーネント
 * 再利用可能で、スタイルをカスタマイズ可能
 */
export function LogoutButton({
  className,
  variant = "outline",
  size = "default",
  children = "ログアウト",
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      showSuccess("ログアウトしました");
    } catch (error) {
      console.error("Logout error:", error);
      showError("ログアウトに失敗しました");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      {isLoggingOut ? "ログアウト中..." : children}
    </Button>
  );
}
