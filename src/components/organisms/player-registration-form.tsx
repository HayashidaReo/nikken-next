"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 選手登録フォーム用のスキーマ
const playerRegistrationSchema = z.object({
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "代表者電話番号は必須です"),
  representativeEmail: z
    .string()
    .min(1, "代表者メールアドレスは必須です")
    .email("正しいメールアドレスを入力してください"),
  teamName: z.string().min(1, "チーム名（所属名）は必須です"),
  players: z
    .array(z.object({
      fullName: z.string().min(1, "選手名は必須です"),
    }))
    .min(1, "最低1人の選手を登録してください"),
  remarks: z.string(),
});

type PlayerRegistrationData = z.infer<typeof playerRegistrationSchema>;

interface PlayerRegistrationFormProps {
  onSubmit: (data: PlayerRegistrationData) => Promise<void>;
  className?: string;
}

interface ConfirmationDialogProps {
  data: PlayerRegistrationData;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationDialog({ data, onConfirm, onCancel }: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-6">登録内容の確認</h3>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium text-gray-700">代表者名</Label>
                <p className="mt-1">{data.representativeName}</p>
              </div>
              
              <div>
                <Label className="font-medium text-gray-700">代表者電話番号</Label>
                <p className="mt-1">{data.representativePhone}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="font-medium text-gray-700">代表者メールアドレス</Label>
                <p className="mt-1">{data.representativeEmail}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="font-medium text-gray-700">チーム名（所属名）</Label>
                <p className="mt-1 font-medium">{data.teamName}</p>
              </div>
            </div>

            <div>
              <Label className="font-medium text-gray-700">参加選手名</Label>
              <div className="mt-2 space-y-2">
                {data.players.map((player, index) => {
                  const parts = player.fullName.split(" ");
                  const lastName = parts[0] || "";
                  const firstName = parts.slice(1).join(" ") || "";
                  
                  return (
                    <div key={index} className="flex">
                      <span className="w-8 text-gray-500">{index + 1}.</span>
                      <div>
                        <span className="font-medium">{lastName}</span>
                        {firstName && <span className="ml-2">{firstName}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {data.remarks && (
              <div>
                <Label className="font-medium text-gray-700">備考</Label>
                <p className="mt-1 whitespace-pre-wrap">{data.remarks}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel}>
              戻る
            </Button>
            <Button onClick={onConfirm}>
              <CheckCircle className="w-4 h-4 mr-2" />
              送信
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayerRegistrationForm({ onSubmit, className }: PlayerRegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const {
    register,
    control,

    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<PlayerRegistrationData>({
    resolver: zodResolver(playerRegistrationSchema),
    defaultValues: {
      representativeName: "",
      representativePhone: "",
      representativeEmail: "",
      teamName: "",
      players: [{ fullName: "" }],
      remarks: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

  // フォームの変更を監視
  const watchedValues = watch();
  React.useEffect(() => {
    setHasUnsavedChanges(true);
  }, [watchedValues]);

  // ページを離れる際の確認
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        if (!confirm("入力内容が破棄されますがよろしいですか？")) {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  // 選手を追加
  const addPlayer = () => {
    append({ fullName: "" });
  };

  // 選手を削除
  const removePlayer = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // 内容確認ボタン
  const handleConfirmClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      setShowConfirmation(true);
    }
  };

  // 確認ダイアログでの送信
  const handleConfirmedSubmit = async () => {
    setIsLoading(true);
    try {
      const formData = getValues();
      await onSubmit(formData);
      setHasUnsavedChanges(false);
      setShowConfirmation(false);
      router.push("/player-registration/complete");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            選手登録フォーム
          </h1>
          <p className="text-gray-600">
            参加される選手の情報をご入力ください。
          </p>
        </div>

        <form className="space-y-6">
          {/* 代表者情報 */}
          <Card>
            <CardHeader>
              <CardTitle>代表者情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="representativeName">代表者名 *</Label>
                <Input
                  {...register("representativeName")}
                  id="representativeName"
                  placeholder="山田 太郎"
                />
                {errors.representativeName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.representativeName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="representativePhone">代表者電話番号 *</Label>
                <Input
                  {...register("representativePhone")}
                  id="representativePhone"
                  placeholder="090-1234-5678"
                />
                {errors.representativePhone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.representativePhone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="representativeEmail">代表者メールアドレス *</Label>
                <Input
                  {...register("representativeEmail")}
                  id="representativeEmail"
                  type="email"
                  placeholder="example@email.com"
                />
                {errors.representativeEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.representativeEmail.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* チーム情報 */}
          <Card>
            <CardHeader>
              <CardTitle>チーム情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="teamName">チーム名（所属名） *</Label>
                <Input
                  {...register("teamName")}
                  id="teamName"
                  placeholder="東京大学日本拳法部"
                />
                {errors.teamName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.teamName.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 参加選手 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>参加選手名</CardTitle>
                <Button type="button" onClick={addPlayer} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  選手を追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <Label>選手名 * (姓と名の間に半角スペースを入力)</Label>
                      <Input
                        {...register(`players.${index}.fullName`)}
                        placeholder="山田 太郎"
                      />
                      {errors.players?.[index]?.fullName && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.players[index]?.fullName?.message}
                        </p>
                      )}
                    </div>
                    
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayer(index)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {errors.players && typeof errors.players.message === 'string' && (
                  <p className="text-sm text-red-600">
                    {errors.players.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 備考 */}
          <Card>
            <CardHeader>
              <CardTitle>備考欄</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="remarks">備考（自由入力）</Label>
                <Textarea
                  {...register("remarks")}
                  id="remarks"
                  rows={4}
                  placeholder="その他、ご質問やご要望がございましたらご記入ください"
                />
              </div>
            </CardContent>
          </Card>

          {/* 送信ボタン */}
          <div className="text-center">
            <Button
              type="button"
              onClick={handleConfirmClick}
              size="lg"
              disabled={isLoading}
            >
              内容を確認
            </Button>
          </div>
        </form>
      </div>

      {/* 確認ダイアログ */}
      {showConfirmation && (
        <ConfirmationDialog
          data={getValues()}
          onConfirm={handleConfirmedSubmit}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}