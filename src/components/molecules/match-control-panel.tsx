"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Switch } from "@/components/atoms/switch";
import { Label } from "@/components/atoms/label";
import { Save } from "lucide-react";

interface MatchControlPanelProps {
    isPublic: boolean;
    onTogglePublic: () => void;
    onSaveResult: () => void;
    className?: string;
}

export function MatchControlPanel({
    isPublic,
    onTogglePublic,
    onSaveResult,
    className
}: MatchControlPanelProps) {
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

                    <Button onClick={onSaveResult} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        試合結果を保存
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}