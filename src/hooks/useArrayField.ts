"use client";

import { useFieldArray, Control, FieldValues } from "react-hook-form";

/**
 * 配列フィールドの共通操作を提供するhook
 * 追加・削除・最小件数チェックなどを統一
 */
export function useArrayField<T extends FieldValues = FieldValues>(
  control: Control<T>,
  name: string,
  options?: {
    minItems?: number;
    maxItems?: number;
    defaultItem?: Record<string, unknown> | (() => Record<string, unknown>);
    onAdd?: (newItem: Record<string, unknown>) => void;
    onRemove?: (index: number) => void;
    generateId?: () => string;
    onMaxItemsReached?: (maxItems: number) => void;
    onMinItemsRequired?: (minItems: number) => void;
  }
) {
  const { fields, append, remove, move, swap } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  });

  const minItems = options?.minItems ?? 1;
  const maxItems = options?.maxItems;
  const generateId =
    options?.generateId ?? (() => `item-${Date.now()}-${Math.random()}`);

  const addItem = (customItem?: Record<string, unknown>) => {
    if (maxItems && fields.length >= maxItems) {
      options?.onMaxItemsReached?.(maxItems);
      return;
    }

    const defaultItem = options?.defaultItem;
    const resolvedDefaultItem =
      typeof defaultItem === "function" ? defaultItem() : defaultItem || {};
    const newItem = customItem || resolvedDefaultItem;
    const itemWithId = { ...newItem, id: generateId() };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    append(itemWithId as any);
    options?.onAdd?.(itemWithId);
  };

  const removeItem = (index: number) => {
    if (fields.length <= minItems) {
      options?.onMinItemsRequired?.(minItems);
      return;
    }

    remove(index);
    options?.onRemove?.(index);
  };

  const canAdd = !maxItems || fields.length < maxItems;
  const canRemove = fields.length > minItems;

  return {
    fields,
    addItem,
    removeItem,
    moveItem: move,
    swapItems: swap,
    canAdd,
    canRemove,
    itemCount: fields.length,
  };
}
