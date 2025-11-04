"use client";

import { Label } from "@/components/atoms/label";
import { Card, CardContent } from "@/components/atoms/card";
import { TimeAdjuster } from "./time-adjuster";

interface TimePickerProps {
  value: number; // 秒数
  onChange: (seconds: number) => void;
  label?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  label,
  className,
}: TimePickerProps) {
  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              {/* 共通化されたタイマー表示・調整UI */}
              <div className="mb-4">
                <TimeAdjuster
                  value={value}
                  onChange={onChange}
                  size="md"
                  longPressDelay={400}
                  longPressInterval={120}
                />
              </div>

              <p className="text-sm text-gray-500">▲▼ ボタンで時間を調整</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
