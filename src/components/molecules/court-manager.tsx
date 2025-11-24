"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";
import { AnimatePresence } from "framer-motion";
import { AnimatedListItem } from "@/components/atoms/animated-list-item";

interface Court {
  courtId: string;
  courtName: string;
}

interface CourtManagerProps {
  courts: Court[];
  onChange: (courts: Court[]) => void;
  className?: string;
}

// 5桁のランダムUID生成
function generateCourtId(): string {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
}

export function CourtManager({
  courts,
  onChange,
  className,
}: CourtManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddCourt = () => {
    const newCourt: Court = {
      courtId: generateCourtId(),
      courtName: "",
    };
    onChange([...courts, newCourt]);
  };

  const handleRemoveCourt = (index: number) => {
    const newCourts = courts.filter((_, i) => i !== index);
    onChange(newCourts);
  };

  const handleCourtNameChange = (index: number, name: string) => {
    const newCourts = courts.map((court, i) =>
      i === index ? { ...court, courtName: name } : court
    );
    onChange(newCourts);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const newCourts = Array.from(courts);
      const [draggedItem] = newCourts.splice(draggedIndex, 1);
      newCourts.splice(dragOverIndex, 0, draggedItem);
      onChange(newCourts);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  return (
    <div className={className}>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {courts.map((court, index) => (
            <AnimatedListItem
              key={court.courtId}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`flex gap-3 items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md ${draggedIndex === index ? "opacity-50" : ""
                } ${dragOverIndex === index ? "bg-blue-50 border-blue-200" : ""}`}
            >
              {/* ドラッグハンドル */}
              <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* コート名入力 */}
              <div className="flex-1">
                <Input
                  value={court.courtName}
                  onChange={e => handleCourtNameChange(index, e.target.value)}
                  placeholder="例: Aコート, メインコート"
                  className="w-full"
                  maxLength={TEXT_LENGTH_LIMITS.COURT_NAME_MAX}
                />
              </div>

              {/* 削除ボタン */}
              <Button
                type="button"
                onClick={() => handleRemoveCourt(index)}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AnimatedListItem>
          ))}
        </AnimatePresence>

        {courts.length === 0 && (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p>コートが登録されていません</p>
            <p className="text-sm">コートを追加してください</p>
          </div>
        )}

        {/* リストの最後尾にコート追加ボタンを配置 */}
        <div className="mt-2">
          <Button
            type="button"
            onClick={handleAddCourt}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            コート追加
          </Button>
        </div>
      </div>
    </div>
  );
}
