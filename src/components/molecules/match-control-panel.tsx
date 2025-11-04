"use client";

import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Switch } from "@/components/atoms/switch";
import { Label } from "@/components/atoms/label";
import { Save } from "lucide-react";
import { useToast } from "@/components/providers/notification-provider";

interface MatchControlPanelProps {
  isPublic: boolean;
  onTogglePublic: () => void;
  onSaveResult: (organizationId: string, tournamentId: string) => void;
  organizationId: string;
  tournamentId: string;
  className?: string;
}

export function MatchControlPanel({
  isPublic,
  onTogglePublic,
  onSaveResult,
  organizationId,
  tournamentId,
  className,
}: MatchControlPanelProps) {
  const { showSuccess } = useToast();

  const handleSave = async () => {
    try {
      await onSaveResult(organizationId, tournamentId);
      showSuccess("試合結果を保存しました");
    } catch (error) {
      console.error("保存エラー:", error);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isPublic}
              onCheckedChange={onTogglePublic}
              id="public-toggle"
            />
            <Label htmlFor="public-toggle" className="font-medium">
              {isPublic ? "公開中" : "非公開"}
            </Label>
          </div>

          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4 mr-2" />
            試合結果を保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
