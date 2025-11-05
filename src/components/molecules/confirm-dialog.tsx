"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { AlertCircle } from "lucide-react";
import { DialogOverlay } from "./dialog-overlay";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "キャンセル",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <DialogOverlay isOpen={isOpen} onClose={onCancel}>
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`p-3 rounded-full ${
                variant === "destructive" ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              <AlertCircle
                className={`h-8 w-8 ${
                  variant === "destructive" ? "text-red-600" : "text-blue-600"
                }`}
              />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 text-center">
            <p>{message}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              variant={variant === "destructive" ? "destructive" : "default"}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DialogOverlay>
  );
}
