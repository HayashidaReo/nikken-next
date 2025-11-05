"use client";

import { Button } from "@/components/atoms/button";

interface FormHeaderProps {
  title: string;
  onCancel?: () => void;
  className?: string;
}

/**
 * フォームヘッダーコンポーネント
 * タイトルとキャンセルボタンを含むヘッダー
 */
export function FormHeader({
  title,
  onCancel,
  className = "",
}: FormHeaderProps) {
  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {onCancel && (
        <Button onClick={onCancel} variant="outline" size="sm">
          キャンセル
        </Button>
      )}
    </div>
  );
}
