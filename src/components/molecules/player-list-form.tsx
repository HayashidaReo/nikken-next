"use client";

import * as React from "react";
import { useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

import { AddButton, RemoveButton } from './action-buttons';

interface PlayerListFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any  
    errors: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: any;
}

export function PlayerListForm({ control, errors, register }: PlayerListFormProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "players",
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>選手一覧</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                            <Label htmlFor={`players.${index}.fullName`}>
                                選手名 {index + 1}
                            </Label>
                            <Input
                                {...register(`players.${index}.fullName`)}
                                id={`players.${index}.fullName`}
                                placeholder="選手の氏名を入力"
                                className={errors.players?.[index]?.fullName ? "border-red-500" : ""}
                            />
                            {errors.players?.[index]?.fullName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.players?.[index]?.fullName?.message}
                                </p>
                            )}
                        </div>

                        {fields.length > 1 && (
                            <RemoveButton
                                onClick={() => remove(index)}
                                className="mt-6 shrink-0"
                            />
                        )}
                    </div>
                ))}

                <AddButton
                    onClick={() => append({ fullName: "" })}
                    className="w-full"
                >
                    選手を追加
                </AddButton>                {errors.players?.root && (
                    <p className="text-red-500 text-sm">{errors.players.root.message}</p>
                )}
            </CardContent>
        </Card>
    );
}