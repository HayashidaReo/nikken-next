import * as React from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { TimePicker } from "@/components/molecules/time-picker";
import { CourtManager } from "@/components/molecules/court-manager";
import { formatDateToInputValue, parseInputValueToDate } from "@/lib/utils/date-utils";
import type { TournamentFormData } from "@/types/tournament.schema";

interface TournamentFormProps {
    formData: TournamentFormData;
    isAddingNew: boolean;
    onFormChange: (field: keyof TournamentFormData, value: string | number | Date | null | { courtId: string; courtName: string }[]) => void;
    onSave: () => void;
    onCancel?: () => void;
    className?: string;
}

/**
 * 大会設定フォームコンポーネント
 * 大会情報の編集・作成フォーム機能を提供
 */
export function TournamentForm({
    formData,
    isAddingNew,
    onFormChange,
    onSave,
    onCancel,
    className = ""
}: TournamentFormProps) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                    {isAddingNew ? "新規大会作成" : "大会編集"}
                </h3>
                {onCancel && (
                    <Button onClick={onCancel} variant="outline" size="sm">
                        キャンセル
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                {/* 大会名 */}
                <div>
                    <Label htmlFor="tournamentName">大会名</Label>
                    <Input
                        id="tournamentName"
                        value={formData.tournamentName}
                        onChange={(e) => onFormChange("tournamentName", e.target.value)}
                        placeholder="大会名を入力してください"
                        className="mt-1"
                    />
                </div>

                {/* 開催日 */}
                <div>
                    <Label htmlFor="tournamentDate">開催日</Label>
                    <Input
                        id="tournamentDate"
                        type="date"
                        value={formatDateToInputValue(formData.tournamentDate)}
                        onChange={(e) => onFormChange("tournamentDate", parseInputValueToDate(e.target.value))}
                        className="mt-1"
                        required
                    />
                </div>

                {/* 大会概要 */}
                <div>
                    <Label htmlFor="tournamentDetail">大会概要</Label>
                    <Textarea
                        id="tournamentDetail"
                        value={formData.tournamentDetail || ""}
                        onChange={(e) => onFormChange("tournamentDetail", e.target.value)}
                        placeholder="大会の詳細情報や説明を入力してください"
                        rows={4}
                        className="mt-1"
                    />
                </div>

                {/* 開催場所 */}
                <div>
                    <Label htmlFor="location">開催場所</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => onFormChange("location", e.target.value)}
                        placeholder="開催場所を入力してください"
                        className="mt-1"
                    />
                </div>

                {/* デフォルト試合時間 */}
                <div>
                    <Label htmlFor="defaultMatchTime">デフォルト試合時間</Label>
                    <TimePicker
                        value={formData.defaultMatchTime}
                        onChange={(seconds) => onFormChange("defaultMatchTime", seconds)}
                        className="mt-1"
                    />
                </div>

                {/* コート管理 */}
                <div>
                    <Label>コート設定</Label>
                    <CourtManager
                        courts={formData.courts}
                        onChange={(courts) => onFormChange("courts", courts)}
                        className="mt-1"
                    />
                </div>

                {/* 保存ボタン */}
                <div className="flex justify-end pt-4">
                    <Button onClick={onSave} className="px-8">
                        {isAddingNew ? "大会を作成" : "変更を保存"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * 大会未選択時の表示コンポーネント
 */
export function TournamentFormPlaceholder({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">大会を選択してください</h3>
                <p className="text-gray-500">
                    左側の大会リストから編集したい大会を選択するか、
                    <br />
                    新しい大会を作成してください。
                </p>
            </div>
        </div>
    );
}