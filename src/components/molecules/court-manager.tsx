"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";
import { useToast } from "@/components/providers/notification-provider";
import { AnimatePresence } from "framer-motion";
import { AnimatedListItem } from "@/components/atoms/animated-list-item";
import { useDraggableList } from "@/hooks/useDraggableList";
import { generateShortId } from "@/lib/utils/id-generator";

interface Court {
  courtId: string;
  courtName: string;
}

interface CourtManagerProps {
  courts: Court[];
  onChange: (courts: Court[]) => void;
  className?: string;
}

export function CourtManager({
  courts,
  onChange,
  className,
}: CourtManagerProps) {
  const { showWarning } = useToast();

  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
  } = useDraggableList(courts, onChange);

  const handleAddCourt = () => {
    const newCourt: Court = {
      courtId: generateShortId(),
      courtName: "",
    };
    onChange([...courts, newCourt]);
  };

  const handleRemoveCourt = (index: number) => {
    const newCourts = courts.filter((_, i) => i !== index);
    onChange(newCourts);
  };

  const handleCourtNameChange = (index: number, name: string) => {
    if (name.length > TEXT_LENGTH_LIMITS.COURT_NAME_MAX) {
      showWarning(`コート名は${TEXT_LENGTH_LIMITS.COURT_NAME_MAX}文字以内で入力してください`);
      return;
    }
    const newCourts = courts.map((court, i) =>
      i === index ? { ...court, courtName: name } : court
    );
    onChange(newCourts);
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
