"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  DIALOG_OVERLAY_CLASSES,
  dialogOverlayStyle,
} from "@/lib/utils/dialog-styles";
import { cn } from "@/lib/utils/utils";

interface DialogOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * ダイアログの共通オーバーレイコンポーネント
 * 背景のクリックでダイアログを閉じる機能付き
 */
export function DialogOverlay({
  isOpen,
  onClose,
  children,
  className,
}: DialogOverlayProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // 背景をクリックした場合のみダイアログを閉じる
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const overlay = (
    <div
      className={cn(DIALOG_OVERLAY_CLASSES, className)}
      style={dialogOverlayStyle}
      onClick={handleOverlayClick}
    >
      {children}
    </div>
  );

  // ポータルを使ってオーバーレイを document.body にレンダリング
  // NOTE:
  // ダイアログのオーバーレイはアプリ内の任意の場所から開かれる可能性があります。
  // 例えばテーブルの行 (<tr>) 内や他の構造化された要素の直下でレンダリングすると、
  // DOM の入れ子制約（<div> が <tr> の子になる等）により React のネスト検証や
  // サーバーサイドレンダリング/ハイドレーション時にエラーが発生することがあります。
  // そのためオーバーレイは document.body にポータルしてルート直下に配置し、
  // DOM ネストの問題や z-index / レイヤリングの扱いを安定させます。
  if (typeof document !== "undefined") {
    return createPortal(overlay, document.body);
  }

  return overlay;
}
