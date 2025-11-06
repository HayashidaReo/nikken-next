"use client";

import { useState } from "react";
import { Plus, Minus, GripVertical } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";

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
      <div className="flex justify-between items-center mb-3">
        <Label>会場のコート情報</Label>
        <Button
          type="button"
          onClick={handleAddCourt}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          コート追加
        </Button>
      </div>

      <div className="space-y-3">
        {courts.map((court, index) => (
          <div
            key={court.courtId}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={e => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
            className={`flex gap-3 items-center p-3 bg-gray-50 rounded-lg border transition-all ${draggedIndex === index ? "opacity-50" : ""
              } ${dragOverIndex === index ? "border-blue-500 bg-blue-50" : ""}`}
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
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {courts.length === 0 && (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p>コートが登録されていません</p>
            <p className="text-sm">コートを追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
