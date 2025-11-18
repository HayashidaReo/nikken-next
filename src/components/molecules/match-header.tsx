"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { Monitor, Unplug } from "lucide-react";
import { useMonitorStore } from "@/store/use-monitor-store";

interface MatchHeaderProps {
  tournamentName: string;
  courtName: string;
  round: string;
  onOpenMonitor: () => void;
  className?: string;
}

export function MatchHeader({
  tournamentName,
  courtName,
  round,
  onOpenMonitor,
  className,
}: MatchHeaderProps) {
  const isPresentationConnected = useMonitorStore((s) => s.presentationConnected);
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div />
          <Button
            onClick={onOpenMonitor}
            variant={isPresentationConnected ? "destructive" : "outline"}
          >
            {isPresentationConnected ? (
              <>
                <Unplug className="w-4 h-4 mr-2" />
                接続を解除
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 mr-2" />
                表示用モニターを開く
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Label className="text-sm text-gray-600">大会名</Label>
            <p className="font-medium">{tournamentName}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">コート</Label>
            <p className="font-medium">{courtName}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">ラウンド</Label>
            <p className="font-medium">{round}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
